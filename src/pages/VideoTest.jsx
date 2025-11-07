import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function VideoTest() {
  const [videoUrl, setVideoUrl] = useState("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/oldflick-videos/MP4.264%20Sherlock%20Holmes%20-%20Pursuit%20to%20Algiers%20(1945)_Starring%20Basil%20Rathbone%20%26%20Nigel%20Bruce_HD(3).mp4");
  const [testResults, setTestResults] = useState(null);
  const [testing, setTesting] = useState(false);
  const videoRef = useRef(null);

  const testVideo = async () => {
    setTesting(true);
    setTestResults(null);

    const results = {
      url: videoUrl,
      canPlay: false,
      canPlayType: "",
      videoCodec: null,
      audioCodec: null,
      error: null,
      metadata: null
    };

    try {
      // Test MIME type support
      const video = document.createElement('video');
      results.canPlayType = video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
      
      // Try to load video
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
        
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout loading metadata")), 10000);
          
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            results.canPlay = true;
            results.metadata = {
              duration: videoRef.current.duration,
              videoWidth: videoRef.current.videoWidth,
              videoHeight: videoRef.current.videoHeight,
              readyState: videoRef.current.readyState,
              networkState: videoRef.current.networkState
            };
            resolve();
          };
          
          videoRef.current.onerror = (e) => {
            clearTimeout(timeout);
            results.error = {
              code: videoRef.current.error?.code,
              message: videoRef.current.error?.message,
              MEDIA_ERR_ABORTED: 1,
              MEDIA_ERR_NETWORK: 2,
              MEDIA_ERR_DECODE: 3,
              MEDIA_ERR_SRC_NOT_SUPPORTED: 4
            };
            reject(e);
          };
        });
      }
    } catch (err) {
      results.error = results.error || { message: err.message };
    }

    setTestResults(results);
    setTesting(false);
  };

  return (
    <div className="min-h-screen oldflick-gradient py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">Video Codec Tester</h1>

        <Card className="bg-white/5 border-white/10 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Test Video URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              placeholder="Enter video URL"
            />
            <Button
              onClick={testVideo}
              disabled={testing || !videoUrl}
              className="bg-[var(--oldflick-burgundy)] hover:bg-[var(--oldflick-burgundy)]/90"
            >
              {testing ? "Testing..." : "Test Video"}
            </Button>
          </CardContent>
        </Card>

        {testResults && (
          <Card className="bg-white/5 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {testResults.canPlay ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">BROWSER SUPPORT</h3>
                <p className="text-white">
                  Can play H.264 MP4: <span className={testResults.canPlayType ? "text-green-400" : "text-red-400"}>
                    {testResults.canPlayType || "No"}
                  </span>
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">VIDEO FILE</h3>
                <p className="text-white break-all text-sm">{testResults.url}</p>
              </div>

              {testResults.metadata && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">METADATA</h3>
                  <div className="space-y-1 text-sm">
                    <p className="text-white">Duration: {Math.floor(testResults.metadata.duration / 60)}m {Math.floor(testResults.metadata.duration % 60)}s</p>
                    <p className="text-white">Resolution: {testResults.metadata.videoWidth}x{testResults.metadata.videoHeight}</p>
                    <p className="text-white">Ready State: {testResults.metadata.readyState}</p>
                    <p className="text-white">Network State: {testResults.metadata.networkState}</p>
                  </div>
                </div>
              )}

              {testResults.error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-semibold mb-1">Error Details:</p>
                      <p className="text-red-300 text-sm">Code: {testResults.error.code}</p>
                      <p className="text-red-300 text-sm">Message: {testResults.error.message}</p>
                      {testResults.error.code === 4 && (
                        <p className="text-red-300 text-sm mt-2">
                          ❌ MEDIA_ERR_SRC_NOT_SUPPORTED - Video format not supported by browser
                        </p>
                      )}
                      {testResults.error.code === 3 && (
                        <p className="text-red-300 text-sm mt-2">
                          ❌ MEDIA_ERR_DECODE - Video file is corrupted or codec not supported
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm font-semibold mb-2">Recommended Solution:</p>
                <ul className="text-blue-200 text-sm space-y-1">
                  <li>• Use <strong>HandBrake</strong> instead of CloudConvert</li>
                  <li>• Set Video Codec: <strong>H.264 (x264)</strong></li>
                  <li>• Set Audio Codec: <strong>AAC</strong></li>
                  <li>• Profile: <strong>High Profile</strong>, Level <strong>4.0</strong></li>
                  <li>• Container: <strong>MP4</strong></li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden test video */}
        <video ref={videoRef} style={{ display: 'none' }} />

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <video
              src={videoUrl}
              controls
              className="w-full rounded-lg"
              onError={(e) => {
                console.error("Video error:", e);
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}