import { useSync } from "@tldraw/sync";

import {
    AssetRecordType,
    getHashForString,
    TLAssetStore,
    TLBookmarkAsset,
    Tldraw,
    uniqueId,
} from "tldraw";

import { getAssetUrlsByMetaUrl } from "@tldraw/assets/urls";
import { useParams } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";

const assetUrls = getAssetUrlsByMetaUrl();

let WORKER_URL = import.meta.env.VITE_WORKER_URL ?? "http://localhost:5858";
if (import.meta.env.MODE === "production") {
    WORKER_URL = window.location.origin;
}

export function Room() {
    const { roomId } = useParams<{ roomId: string }>();

    const store = useSync({
        uri: `${WORKER_URL}/api/connect/${roomId}`,
        assets: multiplayerAssets,
    });

    return (
        <RoomWrapper roomId={roomId}>
            <Tldraw
                store={store}
                assetUrls={assetUrls}
                deepLinks
                onMount={(editor) => {
                    // @ts-expect-error
                    window.editor = editor;
                    editor.registerExternalAssetHandler(
                        "url",
                        unfurlBookmarkUrl,
                    );
                }}
            />
        </RoomWrapper>
    );
}

function RoomWrapper({
    children,
    roomId,
}: {
    children: ReactNode;
    roomId?: string;
}) {
    const [didCopy, setDidCopy] = useState(false);
    const isMain = roomId === "main";

    useEffect(() => {
        if (!didCopy) return;
        const timeout = setTimeout(() => setDidCopy(false), 3000);
        return () => clearTimeout(timeout);
    }, [didCopy]);

    return (
        <div className="RoomWrapper">
            {!isMain && (
                <div className="RoomWrapper-header">
                    <WifiIcon />
                    <div>{roomId}</div>
                    <button
                        className="RoomWrapper-copy"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setDidCopy(true);
                        }}
                        aria-label="copy room link"
                    >
                        Copy link
                        {didCopy && (
                            <div className="RoomWrapper-copied">Copied!</div>
                        )}
                    </button>
                </div>
            )}
            <div className="RoomWrapper-content">{children}</div>
        </div>
    );
}

const multiplayerAssets: TLAssetStore = {
    async upload(_asset, file) {
        const id = uniqueId();
        const objectName = `${id}-${file.name}`;
        const url = `${WORKER_URL}/api/uploads/${encodeURIComponent(objectName)}`;
        const response = await fetch(url, {
            method: "PUT",
            body: file,
        });
        if (!response.ok) {
            throw new Error(`Failed to upload asset: ${response.statusText}`);
        }
        return { src: url };
    },
    resolve(asset) {
        return asset.props.src;
    },
};

async function unfurlBookmarkUrl({
    url,
}: {
    url: string;
}): Promise<TLBookmarkAsset> {
    const asset: TLBookmarkAsset = {
        id: AssetRecordType.createId(getHashForString(url)),
        typeName: "asset",
        type: "bookmark",
        meta: {},
        props: {
            src: url,
            description: "",
            image: "",
            favicon: "",
            title: "",
        },
    };
    try {
        const response = await fetch(
            `${WORKER_URL}/api/unfurl?url=${encodeURIComponent(url)}`,
        );
        const data = await response.json();
        asset.props.description = data?.description ?? "";
        asset.props.image = data?.image ?? "";
        asset.props.favicon = data?.favicon ?? "";
        asset.props.title = data?.title ?? "";
    } catch (e) {
        console.error(e);
    }
    return asset;
}

function WifiIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            width={16}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
            />
        </svg>
    );
}
