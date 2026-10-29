// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import LoadingState from './LoadingState';
import {TableSkeleton} from './Skeleton';
import DataTable from './DataTable';
import Button from './Button';
afterEach(cleanup);
it('announces table loading and hides the decorative loading mark', () => {
 render(<TableSkeleton rows={3} cols={8} label="Loading products" />);
 const status=screen.getByRole('status',{name:'Loading products'});
 expect(status.getAttribute('aria-busy')).toBe('true');
 expect(status.querySelector('.loading-page__mark').getAttribute('aria-hidden')).toBe('true');
 expect(status.querySelector('.loading-page__ring')).toBeTruthy();
 expect(status.querySelector('.loading-skeleton')).toBeNull();
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
it('uses the new loader for cards and preserves button loading indicators', () => {
 const {unmount}=render(<LoadingState variant="cards" count={3} label="Loading orders" />);
 expect(screen.getByRole('status', {name:'Loading orders'}).querySelector('.loading-page__ring')).toBeTruthy();
 expect(document.querySelector('.loading-card')).toBeNull();unmount();
 render(<Button loading>Save settings</Button>);
 expect(screen.getByRole('button',{name:'Save settings'}).disabled).toBe(true);
 expect(screen.getByRole('button').getAttribute('aria-busy')).toBe('true');
 expect(document.querySelector('.loading-indicator').getAttribute('aria-hidden')).toBe('true');
});
