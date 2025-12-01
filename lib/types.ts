/**
 * ArcESC - Otomatik Hakemlik ile Koşullu Mutabakat Mimarisi
 * Type Definitions ve Data Models
 */

// ============= Emanet Durumları (Solidity Enum) =============
export enum EscrowStatus {
  PENDING = 0,   // Beklemede - fonlar kilitli
  RELEASED = 1,  // Serbest - fonlar alıcıya gönderildi
  REFUNDED = 2   // İade - fonlar gönderene geri döndürüldü
}

// ============= Hakem Karar Durumları (Solidity Enum) =============
export enum SettlementStatus {
  PENDING = 0,    // Hakem kararı bekleniyor
  SETTLED = 1,    // Hizmet tamamlandı, serbest bırakılmaya hazır
  DISPUTED = 2,   // Anlaşmazlık var
  CANCELLED = 3   // İptal edildi
}

// ============= Veri Modelleri =============

/**
 * Escrow İşlemi Modeli
 * SimpleEscrow.sol üzerindeki Escrow struct'ına karşılık gelir
 */
export interface Escrow {
  id: number;              // Emanet ID'si
  payer: string;           // Ödeme yapan (fon sağlayan) - 0x address
  payee: string;           // Ödenen (alıcı/hizmet sağlayıcı) - 0x address
  amount: string;          // USDC miktarı (wei cinsinden, 6 decimal)
  amountFormatted: string; // Görüntülenebilir format (USDC)
  deadline: number;        // Geri döndürme son tarihi (unix timestamp)
  deadlineFormatted: string; // Readable format
  status: EscrowStatus;    // Emanet durumu
  description: string;     // İşlem açıklaması
  createdAt: number;       // Oluşturulma tarihi (unix timestamp)
  timeRemaining: number;   // Kalan zaman (saniye)
  timeRemainingFormatted: string; // Readable format
}

/**
 * Hakem Kararı Modeli
 * ArbitrationOracle.sol üzerindeki Settlement struct'ına karşılık gelir
 */
export interface Settlement {
  escrowId: number;           // İlişkili emanet ID'si
  arbitrator: string;         // Hakem adresi (0x address)
  status: SettlementStatus;   // Karar durumu
  timestamp: number;          // Karar tarihi (unix timestamp)
  timestampFormatted: string; // Readable format
  reason: string;             // Karar nedeni/açıklama
  meeTriggered: boolean;      // MEE tarafından yürütüldü mü?
}

/**
 * UI için Birleştirmiş Emanet + Hakem Bilgisi
 */
export interface EscrowWithSettlement {
  escrow: Escrow;
  settlement?: Settlement;
  isSettled?: boolean;  // Hakem tarafından onaylandı mı?
  canBeReleased?: boolean;  // Serbest bırakılabilir mi?
}

/**
 * Emanet Oluşturma Formu Girdileri
 */
export interface CreateEscrowInput {
  payeeAddress: string;  // Alıcı adresi
  amount: string;        // USDC miktarı (user input)
  lockTime: number;      // Kilit süresi (saat)
  description: string;   // Açıklama
  requiresArbitration?: boolean;  // Hakem onayı gerekli mi?
}

/**
 * Hakem Kararı Girdileri
 */
export interface SettleDisputeInput {
  escrowId: number;      // Emanet ID'si
  reason: string;        // Karar nedeni
}

/**
 * MEE Conditional Execution Koşulu
 */
export interface MEECondition {
  type: 'arbitration';   // Koşul türü
  escrowId: number;      // Emanet ID'si
  contractAddress: string; // ArbitrationOracle adresi
  functionName: 'isSettled'; // View fonksiyon
  expectedValue: boolean; // Beklenen değer (true = settled)
}

/**
 * MEE Execute Payload Modeli
 */
export interface MEEExecutePayload {
  instructions: any[];   // Biconomy MEE instructions
  conditions?: MEECondition[];  // Koşullu yürütme koşulları
  feeToken: {
    chainId: number;
    tokenAddress: string;
  };
}

/**
 * Transaction Response
 */
export interface TransactionResponse {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  message: string;
}

/**
 * UI State Snapshot
 */
export interface ArcESCState {
  escrows: Escrow[];
  settlements: Map<number, Settlement>;
  loading: boolean;
  error: string | null;
  userAddress?: string;
  userEscrowsAsCreator: number[];  // Kullanıcının yaratıcı olduğu emanetler
  userEscrowsAsRecipient: number[];  // Kullanıcının alıcı olduğu emanetler
}

/**
 * Hakem Paneli State
 */
export interface ArbitrationPanelState {
  pendingEscrows: Escrow[];
  settledEscrows: Escrow[];
  disputedEscrows: Escrow[];
  selectedEscrow?: number;
  reason: string;
  loading: boolean;
}
