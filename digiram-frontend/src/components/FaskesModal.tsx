import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../app/components/ui/dialog';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../app/components/ui/select';

interface Hospital {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  province?: string;
  type?: string;
  bed_capacity?: number;
}

interface FaskesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (hospital: Hospital) => Promise<void>;
  initialData?: Hospital;
  isLoading?: boolean;
}

export function FaskesModal({ isOpen, onClose, onSave, initialData, isLoading = false }: FaskesModalProps) {
  const [formData, setFormData] = useState<Hospital>(
    initialData || {
      name: '',
      address: '',
      city: '',
      province: '',
      type: '',
      bed_capacity: undefined,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof Hospital, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Nama faskes wajib diisi';
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSave(formData);
      onClose();
      setFormData({
        name: '',
        address: '',
        city: '',
        province: '',
        type: '',
        bed_capacity: undefined,
      });
    } catch (error) {
      console.error('Error saving faskes:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Data Faskes' : 'Tambah Faskes Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Faskes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nama Faskes *</label>
            <Input
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Contoh: Rumah Sakit Umum Daerah..."
              disabled={isLoading}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Alamat</label>
            <Input
              value={formData.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              placeholder="Jl. Contoh No. 123"
              disabled={isLoading}
            />
          </div>

          {/* Kota/Kabupaten & Provinsi */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kota/Kabupaten</label>
              <Input
                value={formData.city || ''}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="Contoh: Yogyakarta"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Provinsi</label>
              <Input
                value={formData.province || ''}
                onChange={e => handleChange('province', e.target.value)}
                placeholder="Contoh: DI Yogyakarta"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Jenis Faskes & Jumlah Tempat Tidur */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Jenis Faskes</label>
              <Select value={formData.type || ''} onValueChange={v => handleChange('type', v)}>
                <SelectTrigger disabled={isLoading}>
                  <SelectValue placeholder="Pilih jenis..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RS Umum">RS Umum</SelectItem>
                  <SelectItem value="RS Khusus">RS Khusus</SelectItem>
                  <SelectItem value="RSUD">RSUD</SelectItem>
                  <SelectItem value="RSB">RSB</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Jumlah Tempat Tidur</label>
              <Input
                type="number"
                value={formData.bed_capacity || ''}
                onChange={e => handleChange('bed_capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Contoh: 250"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
