import { useState } from "react";
import { useListDocuments, useCreateDocument, useDeleteDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { FileText, Plus, Trash2, File, FileIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { DocumentDocumentType, DocumentInputDocumentType } from "@workspace/api-client-react";

const currentUserId = 1;

export default function Documents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  const { data: documents, isLoading } = useListDocuments(currentUserId, { 
    query: { enabled: true, queryKey: getListDocumentsQueryKey(currentUserId) }
  });
  
  const createDoc = useCreateDocument();
  const deleteDoc = useDeleteDocument();

  const [newDoc, setNewDoc] = useState({
    name: "",
    documentType: "cv" as DocumentInputDocumentType,
    fileName: "",
    notes: ""
  });

  const handleUpload = () => {
    if (!newDoc.name || !newDoc.fileName) {
      toast({ title: "Validation Error", description: "Name and File are required.", variant: "destructive" });
      return;
    }

    createDoc.mutate({
      id: currentUserId,
      data: {
        name: newDoc.name,
        documentType: newDoc.documentType,
        fileName: newDoc.fileName,
        fileSize: Math.floor(Math.random() * 5000) + 100, // mock size
        mimeType: "application/pdf", // mock mime
        notes: newDoc.notes
      }
    }, {
      onSuccess: () => {
        toast({ title: "Document uploaded successfully!" });
        setIsUploadOpen(false);
        setNewDoc({ name: "", documentType: "cv", fileName: "", notes: "" });
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(currentUserId) });
      }
    });
  };

  const handleDelete = (docId: number) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDoc.mutate({ id: currentUserId, docId }, {
        onSuccess: () => {
          toast({ title: "Document deleted" });
          queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey(currentUserId) });
        }
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'id_document': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'transcript': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cv': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'motivation_letter': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTypeLabel = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Your Documents</h1>
          <p className="text-muted-foreground mt-1">Upload once, use for all applications.</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Add a new document to your secure vault. We only accept PDFs for now.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Document Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. 2024 Updated CV" 
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Document Type</Label>
                <Select 
                  value={newDoc.documentType} 
                  onValueChange={(val: any) => setNewDoc({...newDoc, documentType: val})}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DocumentDocumentType).map((type) => (
                      <SelectItem key={type} value={type}>{formatTypeLabel(type)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="file">File (Mock upload)</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors"
                     onClick={() => setNewDoc({...newDoc, fileName: `mock_file_${Date.now()}.pdf`})}>
                  <File className="h-8 w-8 text-muted-foreground mb-2" />
                  {newDoc.fileName ? (
                    <span className="text-sm font-medium text-primary">{newDoc.fileName}</span>
                  ) : (
                    <>
                      <span className="text-sm font-medium">Click to select file</span>
                      <span className="text-xs text-muted-foreground mt-1">PDF up to 10MB</span>
                    </>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input 
                  id="notes" 
                  placeholder="Any extra info..." 
                  value={newDoc.notes}
                  onChange={(e) => setNewDoc({...newDoc, notes: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button onClick={handleUpload} disabled={createDoc.isPending}>
                {createDoc.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload to Vault
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Card key={i} className="h-40"><CardContent className="p-6"><Loader2 className="animate-spin text-muted-foreground mx-auto mt-8" /></CardContent></Card>)}
        </div>
      ) : documents?.length === 0 ? (
        <div className="text-center py-24 px-6 border-2 border-dashed border-border rounded-2xl bg-muted/10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <FileText size={32} className="text-muted-foreground" />
          </div>
          <h3 className="font-display font-bold text-xl mb-2">Your vault is empty</h3>
          <p className="text-muted-foreground max-w-md mb-6">Upload your ID, transcripts, and CVs here so they are ready when you need to apply.</p>
          <Button onClick={() => setIsUploadOpen(true)} className="rounded-full bg-primary hover:bg-primary/90 text-white">
            Upload First Document
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents?.map((doc) => (
            <Card key={doc.id} className="overflow-hidden hover-elevate transition-all border-border/60 shadow-sm group">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-muted rounded-xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileIcon size={24} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getTypeColor(doc.documentType)}`}>
                      {formatTypeLabel(doc.documentType)}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-1 truncate" title={doc.name}>{doc.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{doc.fileName}</p>
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Added {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      onClick={() => handleDelete(doc.id)}
                      title="Delete document"
                    >
                      {deleteDoc.isPending && deleteDoc.variables?.docId === doc.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
