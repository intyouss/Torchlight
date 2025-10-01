// app/layout.tsx
import './globals.css';

export const metadata = {
    title: '火炬之光：无限 - 伤害计算器',
    description: '《火炬之光：无限》英雄伤害计算器',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
        <body>{children}</body>
        </html>
    );
}