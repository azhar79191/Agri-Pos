// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import LoadingState from './LoadingState';
import {TableSkeleton} from './Skeleton';
import DataTable from './DataTable';
import Button from './Button';
afterEach(cleanup);
it('announces one accessible pending state and hides decorative skeletons', () => {
 render(<TableSkeleton rows={3} cols={8} label="Loading products" />);
 const status=screen.getByRole('status',{name:'Loading products'});
 expect(status.getAttribute('aria-busy')).toBe('true');
 expect(status.querySelectorAll('.loading-table__row')).toHaveLength(4);
 expect(status.querySelector('.loading-table').getAttribute('aria-hidden')).toBe('true');
 expect(document.querySelector('.loading-table__row').style.gridTemplateColumns).toContain('minmax(0, 1fr)');
});
it('replaces loading with the real empty state only after a table request completes', () => {
 const content=<><thead><tr><th>Name</th></tr></thead><tbody /></>;
 const {rerender}=render(<DataTable loading loadingLabel="Loading records">{content}</DataTable>);
 expect(screen.queryByText('No records found')).toBeNull();
 expect(screen.getByRole('status',{name:'Loading records'})).toBeTruthy();
 rerender(<DataTable loading={false}>{content}</DataTable>);
 expect(screen.queryByRole('status',{name:'Loading records'})).toBeNull();
 expect(screen.getByText('No records found')).toBeTruthy();
});
it('supports card placeholders and preserves pending action labels', () => {
 const {unmount}=render(<LoadingState variant="cards" count={3} label="Loading orders" />);
 expect(document.querySelectorAll('.loading-card')).toHaveLength(3);unmount();
 render(<Button loading>Save settings</Button>);
 expect(screen.getByRole('button',{name:'Save settings'}).disabled).toBe(true);
 expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
 expect(document.querySelector('.loading-indicator').getAttribute('aria-hidden')).toBe('true');
});
