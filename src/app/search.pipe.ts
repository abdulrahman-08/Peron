import { Pipe, PipeTransform } from '@angular/core';
import { IProperty } from './interfaces/iproperty';

@Pipe({
  name: 'search',
  standalone:true
})
export class SearchPipe implements PipeTransform {

  transform(items:IProperty[],term:string): IProperty[] {
    return items.filter((item)=>
    item.title.toLowerCase().includes(term.toLowerCase())
    ) ;
  }
}
