import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Products from "./Products";

import Analytics from "./Analytics";

import Suppliers from "./Suppliers";

import Alerts from "./Alerts";

import BulkImport from "./BulkImport";

import BarcodeScanner from "./BarcodeScanner";

import Reports from "./Reports";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Products: Products,
    
    Analytics: Analytics,
    
    Suppliers: Suppliers,
    
    Alerts: Alerts,
    
    BulkImport: BulkImport,
    
    BarcodeScanner: BarcodeScanner,
    
    Reports: Reports,
    
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
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Suppliers" element={<Suppliers />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/BulkImport" element={<BulkImport />} />
                
                <Route path="/BarcodeScanner" element={<BarcodeScanner />} />
                
                <Route path="/Reports" element={<Reports />} />
                
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