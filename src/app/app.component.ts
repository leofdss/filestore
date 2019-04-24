import { Component } from '@angular/core';
import { FileService } from './service/file.service';
import { Observable } from 'rxjs';
import { FileElement } from './model/element';
import { FileUploader } from 'ng2-file-upload';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public fileElements: Observable<FileElement[]>;

  constructor(
    public fileService: FileService
  ) { }

  currentRoot: FileElement;
  currentPath: string;
  canNavigateUp = false;

  public uploader: FileUploader;

  ngOnInit() {
    this.update();
  }

  /** Atualiza itens na tela com o servidor */
  update() {
    if (!this.currentRoot) {
      this.uploader = this.fileService.newFileUploader('');
      this.fileService.clear();
      this.getFiles('', 'root');
    } else {
      this.uploader = this.fileService.newFileUploader(this.currentPath);
      this.fileService.delete(this.currentRoot.id);
      this.currentRoot = this.fileService.add(this.fileService.clone(this.currentRoot));
      this.getFiles(this.currentPath, this.currentRoot.id);
    }
  }

  download(element: FileElement) {
    let path;
    if (!this.currentPath) {
      path = element.name;
    } else {
      path = this.currentPath + element.name;
    }
    path = ':' + path.replace(/[/]/g, ':');
    this.fileService.download(path).subscribe((event: any) => {
      if (event.type === HttpEventType.DownloadProgress) {
        const percentDone = Math.round(100 * event.loaded / event.total);
        this.fileService.update(element.id, { progress: percentDone });
        console.log('File is ' + percentDone + '% downloaded.');
      } else if (event instanceof HttpResponse) {
        this.fileService.update(element.id, { progress: 100 });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(event.body);
        a.download = element.name;
        a.click();
        console.log('File is completely downloaded!');
      }
      this.updateFileElementQuery();
    });
  }

  /** Busca arquivos no servidor */
  getFiles(url: string, parent: string) {
    let path = ':' + url.replace(/[/]/g, ':');
    this.fileService.getFiles(path).subscribe(
      (data: any) => {
        if (data.files) {
          for (let item of data.files) {
            let isFolder = true;
            if (item.includes('.')) {
              isFolder = false;
            }
            let element = {
              name: item,
              isFolder: isFolder,
              parent: parent,
              loading: false
            }
            this.fileService.add(element);
          }
          this.updateFileElementQuery();
        }
      }
    );
  }

  /** Adiciona uma nova pasta */
  addFolder(folder: { name: string }) {
    let path;
    if (!this.currentPath) {
      path = '/' + folder.name;
    } else {
      path = '/' + this.currentPath + folder.name;
    }
    this.fileService.createFolder(path)
      .subscribe((data) => {
        this.fileService.add({
          isFolder: true,
          loading: false,
          name: folder.name,
          parent: this.currentRoot ? this.currentRoot.id : 'root'
        });
        this.updateFileElementQuery();
      }, (error) => {
        console.log(error);
      })
  }

  /** Deletar arquivo ou pasta */
  removeElement(element: FileElement) {
    let path;
    if (!this.currentPath) {
      path = element.name;
    } else {
      path = this.currentPath + element.name;
    }
    path = ':' + path.replace(/[/]/g, ':');
    this.fileService.deleteFiles(path)
      .subscribe(data => {
        this.fileService.delete(element.id);
        this.updateFileElementQuery();
      }, error => {
        console.log(error);
      });
  }

  /** Entra na pasta selecionada */
  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
    if (!element.loading) {
      element.loading = true;
      this.fileService.update(element.id, element);
      this.getFiles(this.currentPath, element.id);
    }

    this.uploader = this.fileService.newFileUploader(this.currentPath);
  }

  /** Retorna para pasta pai */
  navigateUp() {
    if (this.currentRoot && this.currentRoot.parent === 'root') {
      this.currentRoot = null;
      this.canNavigateUp = false;
      this.updateFileElementQuery();
    } else {
      this.currentRoot = this.fileService.get(this.currentRoot.parent);
      this.updateFileElementQuery();
    }
    this.currentPath = this.popFromPath(this.currentPath.replace(/[/]/g, ':'));
  }

  /** Mover arquivo ou pasta */
  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    let oldPath;
    let path;
    if (!this.currentPath) {
      oldPath = '/' + event.element.name;
      path = '/' + event.moveTo.name + '/' + event.element.name;
    } else {
      oldPath = '/' + this.currentPath + event.element.name;
      path = '/' + this.currentPath + event.moveTo.name + '/' + event.element.name;
    }
    this.fileService.renameFiles({
      oldPath: oldPath,
      path: path
    }).subscribe(data => {
      if (event.moveTo.loading) {
        this.fileService.update(event.element.id, { parent: event.moveTo.id });
        this.updateFileElementQuery();
      } else {
        this.fileService.delete(event.element.id);
        this.updateFileElementQuery();
      }
    }, error => {
      console.log(error);
    });
  }

  /** Renomear arquivo ou pasta */
  renameElement(element: FileElement) {
    let name = this.fileService.get(element.id).name;
    let oldPath;
    let path;
    if (!this.currentPath) {
      oldPath = '/' + name;
      path = '/' + element.name;
    } else {
      oldPath = '/' + this.currentPath + name;
      path = '/' + this.currentPath + element.name;
    }
    this.fileService.renameFiles({
      oldPath: oldPath,
      path: path
    }).subscribe((data) => {
      this.fileService.update(element.id, { name: element.name });
      this.updateFileElementQuery();
    }, (error) => {
      //catch the error
      console.error("An error occurred, ", error);
    });
  }

  /** Atualiza elementos no HTML */
  updateFileElementQuery() {
    this.fileElements = this.fileService.queryInFolder(this.currentRoot ? this.currentRoot.id : 'root');
  }

  pushToPath(path: string, folderName: string) {
    let p = path ? path : '';
    p += `${folderName}/`;
    return p;
  }

  popFromPath(path: string) {
    let p = path ? path : '';
    let split = p.split('/');
    split.splice(split.length - 2, 1);
    p = split.join('/');
    return p;
  }
}
