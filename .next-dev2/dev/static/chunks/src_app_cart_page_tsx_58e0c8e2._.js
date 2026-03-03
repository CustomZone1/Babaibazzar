(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/cart/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CartPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cart.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/settings.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function money(paise) {
    return `Rs ${Math.round(paise / 100)}`;
}
function normalizeImageUrl(url) {
    const u = (url || "").trim();
    if (!u) return "";
    if (u.startsWith("uploads/")) return `/${u}`;
    return u;
}
function CartPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(21);
    if ($[0] !== "651820e96c663d65ccd7d4b6eef912c8081985585ad36a67864506a94454c9b6") {
        for(let $i = 0; $i < 21; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "651820e96c663d65ccd7d4b6eef912c8081985585ad36a67864506a94454c9b6";
    }
    const cart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const { lang } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"])();
    const hi = lang === "hi";
    let t0;
    if ($[1] !== cart.items) {
        t0 = cart.items ?? [];
        $[1] = cart.items;
        $[2] = t0;
    } else {
        t0 = $[2];
    }
    const items = t0;
    let t = 0;
    if ($[3] !== items || $[4] !== t) {
        for (const it of items){
            t = t + (Number(it.qty ?? 0) || 0);
        }
        $[3] = items;
        $[4] = t;
        $[5] = t;
    } else {
        t = $[5];
    }
    const qtySum = t;
    const t1 = hi ? "?????" : "Cart";
    let t2;
    if ($[6] !== t1) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
            className: "text-2xl font-bold",
            children: t1
        }, void 0, false, {
            fileName: "[project]/src/app/cart/page.tsx",
            lineNumber: 54,
            columnNumber: 10
        }, this);
        $[6] = t1;
        $[7] = t2;
    } else {
        t2 = $[7];
    }
    const t3 = hi ? "? ??????? ?? ????" : "? Back to shops";
    let t4;
    if ($[8] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: "/",
            className: "text-sm text-blue-600",
            children: t3
        }, void 0, false, {
            fileName: "[project]/src/app/cart/page.tsx",
            lineNumber: 63,
            columnNumber: 10
        }, this);
        $[8] = t3;
        $[9] = t4;
    } else {
        t4 = $[9];
    }
    let t5;
    if ($[10] !== t2 || $[11] !== t4) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "mb-6 flex items-center justify-between",
            children: [
                t2,
                t4
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/cart/page.tsx",
            lineNumber: 71,
            columnNumber: 10
        }, this);
        $[10] = t2;
        $[11] = t4;
        $[12] = t5;
    } else {
        t5 = $[12];
    }
    let t6;
    if ($[13] !== cart || $[14] !== hi || $[15] !== items || $[16] !== qtySum) {
        t6 = items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-lg border bg-white p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-gray-600",
                children: hi ? "???? ????? ???? ???" : "Your cart is empty."
            }, void 0, false, {
                fileName: "[project]/src/app/cart/page.tsx",
                lineNumber: 80,
                columnNumber: 79
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/cart/page.tsx",
            lineNumber: 80,
            columnNumber: 31
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid gap-3",
                    children: items.map({
                        "CartPage[items.map()]": (i)=>{
                            const img = normalizeImageUrl(i.imageUrl);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-4 rounded-lg border bg-white p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-14 w-14 overflow-hidden rounded-lg border bg-gray-100",
                                                children: img ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: img,
                                                    alt: i.name,
                                                    className: "h-full w-full object-cover",
                                                    loading: "lazy",
                                                    onError: _CartPageItemsMapImgOnError
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cart/page.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 247
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex h-full w-full items-center justify-center text-[10px] text-gray-400",
                                                    children: hi ? "??? ???? ????" : "No image"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/cart/page.tsx",
                                                    lineNumber: 83,
                                                    columnNumber: 372
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cart/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 167
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-medium",
                                                        children: i.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cart/page.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 515
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-gray-500",
                                                        children: i.unit ?? ""
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/cart/page.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 558
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm text-green-700",
                                                        children: [
                                                            money(i.pricePaise),
                                                            " ",
                                                            hi ? "?????" : "each"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/cart/page.tsx",
                                                        lineNumber: 83,
                                                        columnNumber: 617
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/cart/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 510
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cart/page.tsx",
                                        lineNumber: 83,
                                        columnNumber: 126
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: {
                                                    "CartPage[items.map() > <button>.onClick]": ()=>{
                                                        const next = (i.qty ?? 1) - 1;
                                                        if (next <= 0) {
                                                            cart.removeItem(i.productId);
                                                        } else {
                                                            cart.setQty(i.productId, next);
                                                        }
                                                    }
                                                }["CartPage[items.map() > <button>.onClick]"],
                                                className: "h-9 w-9 rounded-lg border bg-white text-lg disabled:opacity-50",
                                                disabled: (i.qty ?? 0) <= 0,
                                                children: "-"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cart/page.tsx",
                                                lineNumber: 83,
                                                columnNumber: 761
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-w-8 text-center font-medium",
                                                children: i.qty
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cart/page.tsx",
                                                lineNumber: 92,
                                                columnNumber: 178
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: {
                                                    "CartPage[items.map() > <button>.onClick]": ()=>cart.setQty(i.productId, (i.qty ?? 0) + 1)
                                                }["CartPage[items.map() > <button>.onClick]"],
                                                className: "h-9 w-9 rounded-lg border bg-white text-lg",
                                                children: "+"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/cart/page.tsx",
                                                lineNumber: 92,
                                                columnNumber: 240
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/cart/page.tsx",
                                        lineNumber: 83,
                                        columnNumber: 720
                                    }, this)
                                ]
                            }, i.productId, true, {
                                fileName: "[project]/src/app/cart/page.tsx",
                                lineNumber: 83,
                                columnNumber: 20
                            }, this);
                        }
                    }["CartPage[items.map()]"])
                }, void 0, false, {
                    fileName: "[project]/src/app/cart/page.tsx",
                    lineNumber: 80,
                    columnNumber: 183
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-4 rounded-lg border bg-white p-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-600",
                                    children: hi ? "??????" : "Items"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cart/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 155
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-medium",
                                    children: qtySum
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cart/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 219
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cart/page.tsx",
                            lineNumber: 96,
                            columnNumber: 96
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-2 flex items-center justify-between text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-gray-600",
                                    children: hi ? "??????" : "Subtotal"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cart/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 334
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-semibold",
                                    children: money(cart.totalPaise ?? 0)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cart/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 401
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cart/page.tsx",
                            lineNumber: 96,
                            columnNumber: 270
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: {
                                        "CartPage[<button>.onClick]": ()=>cart.clear()
                                    }["CartPage[<button>.onClick]"],
                                    className: "rounded-lg border px-4 py-2 text-sm",
                                    children: hi ? "??? ????" : "Clear"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cart/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 508
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/checkout",
                                    className: "ml-auto rounded-lg bg-black px-4 py-2 text-sm text-white",
                                    children: hi ? "?????? ?? ????" : "Proceed to Checkout"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/cart/page.tsx",
                                    lineNumber: 98,
                                    columnNumber: 128
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/cart/page.tsx",
                            lineNumber: 96,
                            columnNumber: 475
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/cart/page.tsx",
                    lineNumber: 96,
                    columnNumber: 43
                }, this)
            ]
        }, void 0, true);
        $[13] = cart;
        $[14] = hi;
        $[15] = items;
        $[16] = qtySum;
        $[17] = t6;
    } else {
        t6 = $[17];
    }
    let t7;
    if ($[18] !== t5 || $[19] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "min-h-screen bg-gray-50 p-4",
            children: [
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/cart/page.tsx",
            lineNumber: 109,
            columnNumber: 10
        }, this);
        $[18] = t5;
        $[19] = t6;
        $[20] = t7;
    } else {
        t7 = $[20];
    }
    return t7;
}
_s(CartPage, "purOLEO3z8pBKdnwARaLo33uTf8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cart$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$settings$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSettings"]
    ];
});
_c = CartPage;
function _CartPageItemsMapImgOnError(e) {
    e.currentTarget.style.display = "none";
}
var _c;
__turbopack_context__.k.register(_c, "CartPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_app_cart_page_tsx_58e0c8e2._.js.map