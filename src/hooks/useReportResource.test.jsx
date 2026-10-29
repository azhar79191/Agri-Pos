// @vitest-environment jsdom
import React from 'react';
import {renderHook,waitFor,act,render,screen,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import useReportResource from './useReportResource';
import ReportState from '../components/ui/ReportState';
afterEach(cleanup);
it('shows a failure instead of zero totals and allows retry',async()=>{
 const request=vi.fn().mockRejectedValueOnce(new Error('Service unavailable')).mockResolvedValueOnce({data:{data:{total:170}}});
 const {result}=renderHook(()=>useReportResource(request));
 await waitFor(()=>expect(result.current.error).toBe('Service unavailable'));
 expect(result.current.data).toBeNull();
 render(<ReportState error={result.current.error} onRetry={result.current.retry}><p>Rs. 0</p></ReportState>);
 expect(screen.queryByText('Rs. 0')).toBeNull();
 act(()=>result.current.retry());await waitFor(()=>expect(result.current.data?.total).toBe(170));
});
it('ignores an earlier response after the filter changes',async()=>{
 const resolvers={};const request=vi.fn(params=>new Promise(resolve=>{resolvers[params.period]=resolve;}));
 const {result,rerender}=renderHook(({period})=>useReportResource(request,{period}),{initialProps:{period:'old'}});
 await waitFor(()=>expect(resolvers.old).toBeTruthy());rerender({period:'new'});
 await waitFor(()=>expect(resolvers.new).toBeTruthy());
 await act(async()=>resolvers.new({data:{data:{total:200}}}));
 await act(async()=>resolvers.old({data:{data:{total:10}}}));
 expect(result.current.data.total).toBe(200);
});
it('treats incomplete successful responses as errors rather than zero totals',async()=>{
 const request=vi.fn().mockResolvedValue({data:{success:true}});
 const {result}=renderHook(()=>useReportResource(request));
 await waitFor(()=>expect(result.current.error).toContain('incomplete'));
 expect(result.current.data).toBeNull();
});
