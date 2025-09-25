
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useBlocklist } from '@/hooks/use-blocklist';
import { useState } from 'react';
import { Badge } from './ui/badge';
import { X } from 'lucide-react';

type BlocklistManagerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BlocklistManager({ open, onOpenChange }: BlocklistManagerProps) {
  const { blocklist, addKeyword, removeKeyword } = useBlocklist();
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword);
      setNewKeyword('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Blocklist</DialogTitle>
          <DialogDescription>
            Add or remove keywords to hide videos from your feed. Keywords are not case-sensitive.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Input
              id="keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="e.g., 'breaking news'"
              onKeyDown={(e) => e.key === 'Enter' && handleAddKeyword()}
            />
            <Button onClick={handleAddKeyword}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 rounded-md border bg-muted/50 p-4 min-h-[80px]">
            {blocklist.length === 0 && (
                <p className="text-sm text-muted-foreground w-full text-center py-4">Your blocklist is empty.</p>
            )}
            {blocklist.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-base">
                {keyword}
                <button onClick={() => removeKeyword(keyword)} className="ml-2 rounded-full p-0.5 hover:bg-destructive/20">
                    <X className="h-3 w-3 text-destructive" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
