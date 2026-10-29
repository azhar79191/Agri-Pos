// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import FilterBar from './FilterBar';
afterEach(cleanup);
it('uses accessible fields and handles default values and clearing', () => {
 const onChange=vi.fn(), onClear=vi.fn();
 render(<FilterBar filters={[{type:'search',key:'search',label:'Search products'},{type:'select',key:'status',label:'Status',defaultValue:'all',options:[{value:'active',label:'Active'}]}]} values={{search:'seed',status:'all'}} onChange={onChange} onClear={onClear} />);
 fireEvent.click(screen.getByRole('combobox',{name:'Status'}));
 fireEvent.click(screen.getByRole('option',{name:'Active'}));
 expect(onChange).toHaveBeenCalledWith('status','active');
 fireEvent.click(screen.getByRole('button',{name:'Clear Search products'}));
 expect(onChange).toHaveBeenCalledWith('search','');
 fireEvent.click(screen.getByRole('button',{name:'Clear'}));expect(onClear).toHaveBeenCalledTimes(1);
});
