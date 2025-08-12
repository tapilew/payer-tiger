"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { avalancheFuji } from "wagmi/chains";

interface ContentItem {
  contentId: string;
  title: string;
  unlockableUrl: string;
  priceUSDC: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const [creatorHandle, setCreatorHandle] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentUrl, setContentUrl] = useState("");
  const [priceUSDC, setPriceUSDC] = useState("");
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load existing content on mount
  useEffect(() => {
    if (isConnected) {
      loadContent();
    }
  }, [isConnected]);

  const loadContent = async () => {
    try {
      const response = await fetch("/api/content");
      if (response.ok) {
        const data = await response.json();
        setContents(data.content || []);
      } else {
        console.error("Failed to load content");
      }
    } catch (error) {
      console.error("Error loading content:", error);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentTitle || !contentUrl || !priceUSDC) return;

    setIsLoading(true);
    try {
      const contentId = `content_${Date.now()}`;
      const response = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
          title: contentTitle,
          unlockableUrl: contentUrl,
          priceUSDC: (Number.parseFloat(priceUSDC) * 1000000).toString(), // Convert to USDC decimals
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Reload content from server
        await loadContent();

        // Reset form
        setContentTitle("");
        setContentUrl("");
        setPriceUSDC("");

        alert("Content created successfully!");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating content:", error);
      alert("Error creating content");
    } finally {
      setIsLoading(false);
    }
  };

  const generateShareUrl = (contentId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/app?creatorHandle=${encodeURIComponent(
      creatorHandle
    )}&contentId=${encodeURIComponent(contentId)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">
            Creator Dashboard
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Connect your wallet to access the creator dashboard
          </p>
          <button
            type="button"
            onClick={() => connect({ connector: connectors[0] })}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const isOnCorrectChain = chainId === avalancheFuji.id;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Payer Tiger Creator Dashboard 💲🐅
            </h1>
            <div className="flex items-center space-x-4">
              {!isOnCorrectChain && (
                <button
                  type="button"
                  onClick={() => switchChain({ chainId: avalancheFuji.id })}
                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700"
                >
                  Switch to Fuji
                </button>
              )}
              <div className="text-sm text-gray-600">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
              <button
                type="button"
                onClick={() => disconnect()}
                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isOnCorrectChain && (
          <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-6">
            Please switch to Avalanche Fuji network to use this dashboard.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Content Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Content</h2>
            <form onSubmit={handleCreateContent} className="space-y-4">
              <div>
                <label
                  htmlFor="creatorHandle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Creator Handle
                </label>
                <input
                  id="creatorHandle"
                  type="text"
                  value={creatorHandle}
                  onChange={(e) => setCreatorHandle(e.target.value)}
                  placeholder="e.g., creator1"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="contentTitle"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content Title
                </label>
                <input
                  id="contentTitle"
                  type="text"
                  value={contentTitle}
                  onChange={(e) => setContentTitle(e.target.value)}
                  placeholder="e.g., Premium Article: The Future of Web3"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="contentUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Content URL (Private Link)
                </label>
                <input
                  id="contentUrl"
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="https://example.com/premium-content"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="priceUSDC"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Price (USDC)
                </label>
                <input
                  id="priceUSDC"
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceUSDC}
                  onChange={(e) => setPriceUSDC(e.target.value)}
                  placeholder="1.00"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !isOnCorrectChain}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Creating..." : "Create Content"}
              </button>
            </form>
          </div>

          {/* Content List */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Your Content</h2>
            {contents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No content created yet. Create your first piece of premium
                content!
              </p>
            ) : (
              <div className="space-y-4">
                {contents.map((content) => (
                  <div
                    key={content.contentId}
                    className="border border-gray-200 rounded p-4"
                  >
                    <h3 className="font-medium text-gray-900">
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Price:{" "}
                      {(Number.parseInt(content.priceUSDC) / 1000000).toFixed(
                        2
                      )}{" "}
                      USDC
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Created:{" "}
                      {new Date(content.createdAt).toLocaleDateString()}
                    </p>

                    {creatorHandle && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Share URL:
                        </p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={generateShareUrl(content.contentId)}
                            readOnly
                            className="flex-1 text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                generateShareUrl(content.contentId)
                              )
                            }
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
