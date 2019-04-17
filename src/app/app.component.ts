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

  update() {
    this.fileService.clear();
    this.getFiles('', 'root');
  }

  getFiles(url: string, parent: string) {
    this.fileService.getFiles(url).subscribe(
      (data: any) => {
        console.log(data);
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
    );
  }

  addFolder(folder: { name: string }) {
    this.fileService.add({
      isFolder: true,
      loading: false,
      name: folder.name,
      parent: this.currentRoot ? this.currentRoot.id : 'root'
    });
    this.updateFileElementQuery();
  }

  removeElement(element: FileElement) {
    this.fileService.delete(element.id);
    this.updateFileElementQuery();
  }

  navigateToFolder(element: FileElement) {
    this.currentRoot = element;
    this.updateFileElementQuery();
    this.currentPath = this.pushToPath(this.currentPath, element.name);
    this.canNavigateUp = true;
    if (!element.loading) {
      element.loading = true;
      this.fileService.update(element.id, element);
      let path = this.currentPath.replace(/[/]/g, ':');
      this.getFiles(path, element.id);
    }
  }

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

  moveElement(event: { element: FileElement; moveTo: FileElement }) {
    this.fileService.update(event.element.id, { parent: event.moveTo.id });
    this.updateFileElementQuery();
  }

  renameElement(element: FileElement) {
    this.fileService.update(element.id, { name: element.name });
    this.updateFileElementQuery();
  }

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
