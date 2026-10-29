// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import Header from './Header';
vi.mock('../context/AppContext',()=>({useApp:()=>({state:{cart:[],currentUser:{name:'Admin',role:'admin'},settings:{brandName:'Company Co',brandLogo:'/company.png'}},actions:{showToast:vi.fn()}})}));
vi.mock('./NotificationCenter',()=>({default:()=>null}));
vi.mock('./GlobalSearch',()=>({default:()=>null}));
vi.mock('./ui/UserAvatar',()=>({default:()=>null}));
vi.mock('../hooks/usePWAInstall',()=>({default:()=>({isInstalled:true})}));
afterEach(cleanup);
it('shows the page title without repeating company branding',()=>{
 render(<MemoryRouter initialEntries={['/products']}><Header /><main><h1>Products</h1></main></MemoryRouter>);
 expect(screen.getAllByRole('heading',{name:'Products'})).toHaveLength(1);
 expect(screen.getByRole('banner').querySelector('p').textContent).toBe('Products');
 expect(screen.queryByLabelText('Company identity')).toBeNull();
 expect(screen.queryByText('Company Co')).toBeNull();
 expect(document.querySelector('img[src="/company.png"]')).toBeNull();
});
