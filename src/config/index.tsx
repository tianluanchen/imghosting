import { Link } from "react-router-dom";
import { CloudUploadOutlined, HistoryOutlined } from "@ant-design/icons";
import { type MenuProps } from "antd";
import type { RouteObject, IndexRouteObject, NonIndexRouteObject } from "react-router-dom";
import { JSX, lazy } from "react";

type Meta = {
    icon?: JSX.Element;
    title: string;
    key?: string;
} & Record<string, any>;

type Item =
    | (IndexRouteObject & {
          meta: Meta;
      })
    | (Omit<
          NonIndexRouteObject & {
              meta: Meta;
          },
          "children"
      > & {
          children?: Item[];
      });

/** routes & menu items  */
const itemList: Item[] = [
    {
        index: true,
        Component: lazy(() => import("@/pages/Home")),
        meta: {
            icon: <CloudUploadOutlined />,
            key: "/",
            title: "layout.uploadPictures"
        }
    },
    {
        path: "/history",
        // element: <History />,
        Component: lazy(() => import("@/pages/History")),
        meta: {
            icon: <HistoryOutlined />,
            title: "layout.history"
        }
        // children: [
        //     {
        //         path: "/history/test",
        //         element: <UploadHistory />,
        //         meta: {
        //             icon: <HistoryOutlined />,
        //             key: 'TEST',
        //             title: "test",
        //         },
        //     }
        // ]
    }
];

/**
 * get menu items
 */
export function getMenuItems(
    handleTitle?: (title: string) => string
): Required<MenuProps>["items"] {
    const deepClone = (list: Item[]): any => {
        const model = Array(list.length).fill(null) as any[];
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            model[i] = {
                ...item.meta,
                key: item.path ?? item.meta.key,
                label: (
                    <Link style={{ color: "inherit" }} to={item.path ?? item.meta.key!}>
                        {handleTitle ? handleTitle(item.meta.title) : item.meta.title}
                    </Link>
                )
            };
            handleTitle && (model[i].title = handleTitle(model[i].title));
            if (item.children) {
                model[i].children = deepClone(item.children);
            }
        }
        return model as any;
    };
    return deepClone(itemList);
}

export function getRoutes() {
    return itemList as RouteObject[];
}

/** Recursive traversal of an array, where a single element may have children */
export function walk<T>(list: T[], callback: (item: T) => void) {
    for (let i = 0; i < list.length; i++) {
        const item = list[i];
        callback(item);
        if ((item as any).children) {
            walk((item as any).children, callback);
        }
    }
}

/** Depth-first traversal of each item */
export function walkItems(callback: (item: Item) => void) {
    walk(itemList, callback);
}
