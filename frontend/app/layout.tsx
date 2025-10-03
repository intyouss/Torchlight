import './globals.css'
import type { Metadata } from 'next'
import React from "react";

export const metadata: Metadata = {
    title: '火炬之光伤害计算器',
    description: '英雄技能伤害计算工具',
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
        <body>{children}</body>
        </html>
    )
}