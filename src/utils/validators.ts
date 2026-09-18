/**
 * Validasi dan utilitas untuk Sistem Operasi Terminal Peti Kemas
 */

// Format standar ISO 6346: 4 huruf kapital + 7 digit angka
export function normalizeContainerNumber(raw: string): string {
  return raw.toUpperCase().replace(/[\s\-_]/g, '');
}

export function validateContainerNumber(num: string): { valid: boolean; error?: string } {
  const normalized = normalizeContainerNumber(num);
  
  if (!normalized) {
    return { valid: false, error: 'Nomor peti kemas wajib diisi' };
  }
  
  if (normalized.length !== 11) {
    return { 
      valid: false, 
      error: `Panjang nomor kontainer harus tepat 11 karakter (4 huruf prefiks + 7 angka). Saat ini: ${normalized.length} karakter.` 
    };
  }

  const prefix = normalized.substring(0, 4);
  const digits = normalized.substring(4);

  if (!/^[A-Z]{4}$/.test(prefix)) {
    return { 
      valid: false, 
      error: '4 karakter pertama harus berupa huruf kapital kode pemilik (Contoh: MSKU, CMAU, TGHU).' 
    };
  }

  if (!/^\d{7}$/.test(digits)) {
    return { 
      valid: false, 
      error: '7 karakter terakhir harus berupa angka serial dan check-digit.' 
    };
  }

  return { valid: true };
}

export function formatContainerNumberDisplay(num: string): string {
  const norm = normalizeContainerNumber(num);
  if (norm.length === 11) {
    return `${norm.slice(0, 4)} ${norm.slice(4, 10)}-${norm.slice(10)}`;
  }
  return num;
}

export function validateGrossWeight(gross: number, tare: number): { valid: boolean; error?: string } {
  if (isNaN(gross) || gross <= 0) {
    return { valid: false, error: 'Berat kotor (Gross Weight) harus berupa angka positif' };
  }
  if (gross < tare) {
    return { valid: false, error: `Berat kotor (${gross} kg) tidak boleh lebih kecil dari berat kosong / tare (${tare} kg)` };
  }
  if (gross > 36000) {
    return { valid: false, error: 'Berat kotor melebihi batas aman maksimum standar peti kemas (36.000 kg)' };
  }
  return { valid: true };
}

export function validateTareWeight(tare: number): { valid: boolean; error?: string } {
  if (isNaN(tare) || tare <= 0) {
    return { valid: false, error: 'Berat kosong (Tare Weight) harus berupa angka positif' };
  }
  if (tare < 1500 || tare > 6000) {
    return { valid: false, error: 'Berat kosong standar kontainer umumnya berkisar antara 1.800 kg - 5.000 kg' };
  }
  return { valid: true };
}
