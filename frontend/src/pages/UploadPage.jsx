import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud, File, X, AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile && selectedFile.name.endsWith(".csv")) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please upload a valid .csv file.");
      setFile(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "An error occurred during upload.");
      }

      const data = await res.json();
      navigate("/dashboard", { state: { auditData: data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 pt-24">
        <Card className="w-full max-w-2xl shadow-xl border-border bg-surface/50 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-white">
              Upload Production Data
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Upload your monthly production CSV file to run the emission audit.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/50"
              >
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-red-800 dark:text-red-300">
                  Error
                </AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div
              className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ease-in-out flex flex-col items-center justify-center gap-4
                ${
                  isDragging
                    ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:bg-slate-50 hover:bg-slate-800/50"
                }
                ${file ? "bg-slate-50 dark:bg-slate-800/50 border-solid" : ""}
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".csv"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />

              {!file ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-lg font-medium text-white">
                      Drag & drop your CSV here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse from your computer
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-surface border border-border text-sm font-medium hover:bg-slate-50 hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Select File
                  </button>
                </>
              ) : (
                <div className="w-full flex items-center justify-between p-4 bg-surface rounded-xl border border-border shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <File className="w-5 h-5 text-primary" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    className="p-2 hover:bg-slate-100 hover:bg-slate-800 rounded-lg transition-colors text-muted-foreground hover:text-red-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all duration-300
                ${
                  !file || loading
                    ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Audit...
                </>
              ) : (
                "Run Emission Audit"
              )}
            </button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default UploadPage;
