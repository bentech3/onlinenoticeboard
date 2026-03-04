import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Monitor, Plus, Trash2, Edit, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

export function SignageProfileManager() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', layout: 'default', rotation_interval: 8000 });

  const { data: profiles = [] } = useQuery({
    queryKey: ['signage-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('signage_profiles').select('*').order('created_at');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingId) {
        const { error } = await supabase.from('signage_profiles').update(form).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('signage_profiles').insert(form);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signage-profiles'] });
      setDialogOpen(false);
      resetForm();
      toast({ title: editingId ? 'Profile updated' : 'Profile created' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('signage_profiles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signage-profiles'] });
      toast({ title: 'Profile deleted' });
    },
  });

  const resetForm = () => {
    setForm({ name: '', location: '', layout: 'default', rotation_interval: 8000 });
    setEditingId(null);
  };

  const startEdit = (profile: any) => {
    setForm({ name: profile.name, location: profile.location || '', layout: profile.layout, rotation_interval: profile.rotation_interval });
    setEditingId(profile.id);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Digital Signage Profiles
            </CardTitle>
            <CardDescription>Configure screen profiles for different locations</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Add Screen</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Add'} Signage Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Screen Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main Hall Display" />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Building A, Floor 1" />
                </div>
                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select value={form.layout} onValueChange={(v) => setForm({ ...form, layout: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default (Full Screen)</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="ticker">Ticker Strip</SelectItem>
                      <SelectItem value="grid">Grid View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rotation Interval (seconds)</Label>
                  <Input
                    type="number"
                    value={form.rotation_interval / 1000}
                    onChange={(e) => setForm({ ...form, rotation_interval: parseInt(e.target.value) * 1000 || 8000 })}
                    min={3} max={60}
                  />
                </div>
                <Button className="w-full" onClick={() => saveMutation.mutate()} disabled={!form.name.trim()}>
                  {editingId ? 'Update' : 'Create'} Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {profiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No signage profiles configured yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Interval</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" />{p.location || '—'}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant="secondary" className="capitalize">{p.layout}</Badge></TableCell>
                  <TableCell>{p.rotation_interval / 1000}s</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(p)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(p.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
