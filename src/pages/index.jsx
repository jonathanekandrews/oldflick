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

import ContentManagement from "./ContentManagement";

import Articles from "./Articles";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Login: Login,
    
    ContentManagement: ContentManagement,
    
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
    
    Articles: Articles,
    
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
                <Route path="/login" element={<Login />} />
                <Route path="/Login" element={<Login />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/Browse" element={<Browse />} />
                <Route path="/watch" element={<Watch />} />
                <Route path="/Watch" element={<Watch />} />
                <Route path="/search" element={<Search />} />
                <Route path="/Search" element={<Search />} />
                <Route path="/account" element={<Account />} />
                <Route path="/Account" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/superadmin" element={<SuperAdmin />} />
                <Route path="/SuperAdmin" element={<SuperAdmin />} />
                <Route path="/videotest" element={<VideoTest />} />
                <Route path="/VideoTest" element={<VideoTest />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/Pricing" element={<Pricing />} />
                <Route path="/stripesetup" element={<StripeSetup />} />
                <Route path="/StripeSetup" element={<StripeSetup />} />
                <Route path="/mylist" element={<MyList />} />
                <Route path="/MyList" element={<MyList />} />
                <Route path="/classicfilms" element={<ClassicFilms />} />
                <Route path="/ClassicFilms" element={<ClassicFilms />} />
                <Route path="/classictv" element={<ClassicTV />} />
                <Route path="/ClassicTV" element={<ClassicTV />} />
                <Route path="/subtest" element={<SubTest />} />
                <Route path="/SubTest" element={<SubTest />} />
                <Route path="/contentmanagement" element={<ContentManagement />} />
                <Route path="/ContentManagement" element={<ContentManagement />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/Articles" element={<Articles />} />
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