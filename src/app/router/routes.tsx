import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { FC } from "react";
import { HomePage } from "@/pages";

export const AppRouter: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </BrowserRouter>
    );
};