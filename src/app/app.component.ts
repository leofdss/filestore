import { Component } from '@angular/core';
import { FileService } from './service/file.service';
import { Observable } from 'rxjs';
import { FileElement } from './model/element';

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

  ngOnInit() {
    this.update();
  }

  /** Atualiza itens na tela com o servidor */
  update() {
    if (!this.currentRoot) {
      this.fileService.clear();
      this.getFiles('', 'root');
    } else {
      this.fileService.delete(this.currentRoot.id);
      this.currentRoot = this.fileService.add(this.fileService.clone(this.currentRoot));
      this.getFiles(this.currentPath, this.currentRoot.id);
    }
  }

  /** Busca arquivos no servidor */
  getFiles(url: string, parent: string) {
    let path = url.replace(/[/]/g, ':');
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
    this.fileService.add({
      isFolder: true,
      loading: false,
      name: folder.name,
      parent: this.currentRoot ? this.currentRoot.id : 'root'
    });
    this.updateFileElementQuery();
  }

  /** Deletar arquivo ou pasta */
  removeElement(element: FileElement) {
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
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
    this.currentPath = this.popFromPath(this.currentPath);
  }

  /** Mover arquivo ou pasta */
  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileElementQuery();
  }

  /** Renomear arquivo ou pasta */
  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
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
