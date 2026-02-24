import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout({ children }) {
  return (
    <div className="app-layout-wrap">
      <Sidebar />
      <div className="app-content-wrap">
        <TopBar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
