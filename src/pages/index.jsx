import Layout from "./Layout.jsx";

import Browse from "./Browse";

import Watch from "./Watch";

import Search from "./Search";

import Account from "./Account";

import Admin from "./Admin";

import SuperAdmin from "./SuperAdmin";

import VideoTest from "./VideoTest";

import Pricing from "./Pricing";

import StripeSetup from "./StripeSetup";

import MyList from "./MyList";

import ClassicFilms from "./ClassicFilms";

import ClassicTV from "./ClassicTV";

import SubTest from "./SubTest";

import Login from "./Login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Login: Login,
    
    Browse: Browse,
    
    Watch: Watch,
    
    Search: Search,
    
    Account: Account,
    
    Admin: Admin,
    
    SuperAdmin: SuperAdmin,
    
    VideoTest: VideoTest,
    
    Pricing: Pricing,
    
    StripeSetup: StripeSetup,
    
    MyList: MyList,
    
    ClassicFilms: ClassicFilms,
    
    ClassicTV: ClassicTV,
    
    SubTest: SubTest,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                <Route path="/" element={<Browse />} />
                
                <Route path="/Login" element={<Login />} />
                
                <Route path="/Browse" element={<Browse />} />
                
                <Route path="/Watch" element={<Watch />} />
                
                <Route path="/Search" element={<Search />} />
                
                <Route path="/Account" element={<Account />} />
                
                <Route path="/Admin" element={<Admin />} />
                
                <Route path="/SuperAdmin" element={<SuperAdmin />} />
                
                <Route path="/VideoTest" element={<VideoTest />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/StripeSetup" element={<StripeSetup />} />
                
                <Route path="/MyList" element={<MyList />} />
                
                <Route path="/ClassicFilms" element={<ClassicFilms />} />
                
                <Route path="/ClassicTV" element={<ClassicTV />} />
                
                <Route path="/SubTest" element={<SubTest />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}