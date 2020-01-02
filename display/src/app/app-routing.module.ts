import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TableComponent } from './components/table/table/table.component';
import { StatusComponent } from './components/status/status.component';


const appRoutes: Routes = [
  { path: "", component: StatusComponent},
  { path: "top10", component: TableComponent },
  { path: "**", redirectTo: "" }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
   