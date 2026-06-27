import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, X, Package, Mail, Edit3, ChevronUp, Leaf, ArrowRight } from 'lucide-react';



import { useNavigate } from 'react-router-dom';

export default function CalculateFee() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [senderZip, setSenderZip] = useState('');
  const [receiverZip, setReceiverZip] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [zipOptions, setZipOptions] = useState<string[]>([]);
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    setTimeout(() => {
      setZipOptions([
        "10110", "10120", "10200", "10310", "10400", "10500",
        "20230", "40000", "44000", "50000", "83000", "90110"
      ]);
    }, 300);
  }, []);

  const packageSizes = [
    { id: 'XXS', name: 'XXS', desc: '(กว้าง+ยาว+สูง ≤ 43 ซม)', icon: <Mail color="#ffcc00" size={28} /> },
    { id: 'JIF', name: 'JIF', desc: '(กว้าง+ยาว+สูง ≤ 51 ซม)', icon: <Package color="#ffcc00" size={28} /> },
    { id: 'XS', name: 'XS', desc: '(กว้าง+ยาว+สูง ≤ 43 ซม)', icon: <Package color="#ffcc00" size={28} /> },
    { id: 'S', name: 'S', desc: '(กว้าง+ยาว+สูง ≤ 51 ซม)', icon: <Package color="#ffcc00" size={28} /> },
    { id: 'M', name: 'M', desc: '(กว้าง+ยาว+สูง ≤ 61 ซม)', icon: <Package color="#ffcc00" size={28} /> },
    { id: 'LRG', name: 'LRG', desc: '(กว้าง+ยาว+สูง ≤ 71 ซม)', icon: <Package color="#ffcc00" size={28} /> },
    { id: 'L+', name: 'L+', desc: '(กว้าง+ยาว+สูง ≤ 81 ซม)', icon: <Package color="#ffcc00" size={28} /> },
    { id: 'XLG', name: 'XLG', desc: '(กว้าง+ยาว+สูง ≤ 97 ซม)', icon: <Package color="#ffcc00" size={28} /> },
  ];


  const handleRequestPrice = () => {
    setShowModal(true);
  };

  const handleSelectPackage = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowModal(false);
    setPrice(38.00);
    setStep('result');
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#ffcc00', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, zIndex: 50 }}>
        <ArrowLeft size={24} cursor="pointer" onClick={() => step === 'result' ? setStep('input') : navigate(-1)} />
        <h2 style={{ fontSize: '1.4rem', margin: 0, fontWeight: 700 }}>ตรวจสอบค่าบริการ</h2>
      </div>

      {step === 'input' ? (
        <>
          {/* ZIP Input Card */}
          <div style={{ padding: '30px 20px', backgroundColor: '#fff' }}>
            <div style={{ position: 'relative' }}>
              {/* Sender */}
              <div style={{ marginBottom: '30px', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                   <MapPin size={24} color="#ffcc00" style={{ fill: 'white', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />
                   <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>ที่อยู่ผู้ส่ง</h3>
                </div>
                <div style={{ paddingLeft: '34px' }}>
                   <div style={{ position: 'relative' }}>
                     <select
                       style={{
                         width: '100%', padding: '14px 16px', borderRadius: '4px', border: '1px solid #ccc',
                         fontSize: '1rem', appearance: 'none', backgroundColor: '#fff', color: senderZip ? '#333' : '#888'
                       }}
                       value={senderZip}
                       onChange={(e) => setSenderZip(e.target.value)}
                     >
                       <option value="" disabled>รหัสไปรษณีย์ *</option>
                       {zipOptions.map(z => <option key={z} value={z}>{z}</option>)}
                     </select>
                     <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                     </div>
                   </div>
                </div>
              </div>

              {/* Dotted line */}
              <div style={{ position: 'absolute', left: '11px', top: '35px', bottom: '65px', width: '2px', borderLeft: '2px dotted #ccc', zIndex: 1 }}></div>

              {/* Receiver */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                   <MapPin size={24} color="#d40511" style={{ fill: 'white', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.1))' }} />
                   <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 600 }}>ที่อยู่ผู้รับ</h3>
                </div>
                <div style={{ paddingLeft: '34px' }}>
                   <div style={{ position: 'relative' }}>
                     <select
                       style={{
                         width: '100%', padding: '14px 16px', borderRadius: '4px', border: '1px solid #ccc',
                         fontSize: '1rem', appearance: 'none', backgroundColor: '#fff', color: receiverZip ? '#333' : '#888'
                       }}
                       value={receiverZip}
                       onChange={(e) => setReceiverZip(e.target.value)}
                     >
                       <option value="" disabled>รหัสไปรษณีย์ *</option>
                       {zipOptions.map(z => <option key={z} value={z}>{z}</option>)}
                     </select>
                     <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666' }}>
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              GREEN PASSPORT PROMO SECTION
          ══════════════════════════════════════════════ */}
          <div style={{ margin: '12px 0 0', padding: '0 16px 16px' }}>
            <button
              onClick={() => navigate('/green-passport')}
              style={{ width:'100%', background:'none', border:'none', padding:0, cursor:'pointer', display:'block', textAlign:'left' }}
            >
              <div style={{
                borderRadius: 16, overflow:'hidden',
                boxShadow: '0 6px 24px rgba(5,150,105,0.22)',
                background: 'linear-gradient(135deg, #059669 0%, #10b981 55%, #34d399 100%)',
                position: 'relative',
              }}>
                {[{x:16,y:14},{x:220,y:10},{x:280,y:50},{x:10,y:70}].map((p,i)=>(
                  <div key={i} style={{ position:'absolute', left:p.x, top:p.y, width:5, height:5, borderRadius:3, background:'rgba(255,255,255,0.25)' }}/>
                ))}
                <div style={{ padding:'16px 16px', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ width:50, height:50, borderRadius:14, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Leaf size={26} color="#fff" strokeWidth={2.5}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.7)', letterSpacing:'1px', textTransform:'uppercase', marginBottom:3 }}>GoGreen Plus</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:'#fff', lineHeight:1.25, marginBottom:2 }}>ส่งพัสดุ ลดคาร์บอน<br/>รับ Green Passport</div>
                  </div>
                  <div style={{ width:38, height:38, borderRadius:19, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }}>
                    <ArrowRight size={20} color="#059669" strokeWidth={2.5}/>
                  </div>
                </div>
                <svg style={{ position:'absolute', right:50, bottom:0, opacity:0.12 }} viewBox="0 0 100 60" width="100">
                  <path d="M10 50 Q40 20 70 10 Q85 5 95 8" fill="none" stroke="#fff" strokeWidth="2" strokeDasharray="4 3"/>
                  <circle cx="10" cy="50" r="4" fill="#fff"/>
                  <circle cx="95" cy="8" r="4" fill="#fff"/>
                </svg>
              </div>
            </button>
          </div>


          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', backgroundColor: '#fff', borderTop: '1px solid #eaeaea', zIndex: 10 }}>
             <button
                onClick={handleRequestPrice}
                disabled={!senderZip || !receiverZip}
                style={{
                  width: '100%', padding: '16px', borderRadius: '4px', border: 'none',
                  backgroundColor: (!senderZip || !receiverZip) ? '#cccccc' : '#d40511',
                  color: '#fff', fontSize: '1.1rem', fontWeight: 600, cursor: (!senderZip || !receiverZip) ? 'not-allowed' : 'pointer'
                }}>
                ขอราคาพัสดุ
             </button>
          </div>
        </>
      ) : (
        <>
          {/* Result View */}
          <div style={{ backgroundColor: '#e0e0e0', paddingBottom: '20px' }}>
            {/* Address Summary */}
            <div style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>ที่อยู่ผู้ส่ง</h3>
                <Edit3 size={20} color="#d40511" cursor="pointer" onClick={() => setStep('input')} />
              </div>
              <p style={{ margin: '0 0 20px 0', fontSize: '1rem', fontWeight: 600 }}>{senderZip}</p>
              
              <div style={{ borderTop: '1px solid #eaeaea', paddingTop: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 5px 0', fontWeight: 700 }}>ที่อยู่ผู้รับ</h3>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{receiverZip}</p>
              </div>
            </div>

            {/* Package Size */}
            <div style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                ขนาดพัสดุ <span style={{ color: '#888', fontSize: '0.9rem', cursor: 'pointer' }}>i</span>
              </h3>
              <div 
                style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                onClick={() => setShowModal(true)}
              >
                <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '4px' }}>ขนาดพัสดุ</div>
                <div style={{ fontSize: '1.1rem' }}>
                  <span style={{ fontWeight: 600 }}>{selectedPackage?.name}</span> <span style={{ color: '#555' }}>{selectedPackage?.desc}</span>
                </div>
              </div>
            </div>

            {/* Delivery Service */}
            <div style={{ backgroundColor: '#fff', padding: '20px', marginBottom: '10px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', fontWeight: 700 }}>เลือกบริการจัดส่งพัสดุ</h3>
              <div style={{ padding: '20px', border: '2px solid #000', borderRadius: '4px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>จัดส่งสินค้าทั่วไป</div>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#000' }}></div>
                  </div>
                </div>
                <div style={{ margin: '15px 0', fontSize: '1rem', fontWeight: 700 }}>
                  <span style={{ fontSize: '0.9rem' }}>THB</span> <span style={{ fontSize: '1.4rem' }}>{price.toFixed(2)}</span>
                </div>
                <div style={{ color: '#666', fontSize: '0.95rem', lineHeight: 1.4 }}>
                  ระยะเวลาในการจัดส่ง 1 - 3 วันทำการ ขึ้นอยู่กับวันเข้ารับพัสดุและพื้นที่จัดส่ง
                </div>
              </div>
            </div>

            {/* Add-on Services */}
            <div style={{ backgroundColor: '#fff', padding: '20px' }}>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 20px 0', fontWeight: 700 }}>บริการเสริม</h3>
              
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', margin: '0 0 10px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ค่าบริการ COD <span style={{ color: '#888', fontSize: '0.9rem' }}>i</span>
                </h4>
                <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ flex: 2, padding: '12px 16px', borderRight: '1px solid #ccc' }}>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>ยอดเงิน</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>THB</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px 16px', backgroundColor: '#f5f5f5' }}>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>ค่าบริการ</div>
                    <div style={{ color: '#888', fontSize: '1.1rem' }}>THB --</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '1rem', margin: '0 0 10px 0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ค่าบริการประกันพัสดุ <span style={{ color: '#888', fontSize: '0.9rem' }}>i</span>
                </h4>
                <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ flex: 2, padding: '12px 16px', borderRight: '1px solid #ccc' }}>
                    <div style={{ color: '#aaa', fontSize: '0.85rem' }}>ยอดเงิน</div>
                    <div style={{ color: '#aaa', fontSize: '1.1rem' }}>THB</div>
                  </div>
                  <div style={{ flex: 1, padding: '12px 16px', backgroundColor: '#f5f5f5' }}>
                    <div style={{ color: '#888', fontSize: '0.85rem' }}>ค่าบริการ</div>
                    <div style={{ color: '#888', fontSize: '1.1rem' }}>THB --</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar for Result */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTop: '1px solid #eaeaea', zIndex: 10, display: 'flex', padding: '16px 20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ cursor: 'pointer' }} onClick={() => setShowSummaryModal(true)}>
              <div style={{ color: '#888', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ค่าบริการทั้งหมด <ChevronUp size={16} color="#d40511" />
              </div>
              <div style={{ color: '#d40511', fontWeight: 800, fontSize: '1.5rem', marginTop: '4px' }}>
                {price.toFixed(2)} <span style={{ fontSize: '1rem', color: '#888', fontWeight: 400 }}>THB</span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/register-package')}
              style={{ backgroundColor: '#d40511', color: '#fff', border: 'none', borderRadius: '4px', padding: '14px 30px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}>
              ส่งพัสดุ
            </button>
          </div>

          {/* Summary Bottom Sheet Modal */}
          {showSummaryModal && (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={() => setShowSummaryModal(false)}></div>
              <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', zIndex: 1001, paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <div style={{ padding: '24px 20px 20px', textAlign: 'center', position: 'relative', borderBottom: '1px solid #eaeaea' }}>
                  <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 800 }}>สรุปค่าบริการ</h2>
                  <div style={{ position: 'absolute', top: '24px', right: '20px', cursor: 'pointer' }} onClick={() => setShowSummaryModal(false)}>
                    <X size={26} color="#d40511" />
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px dashed #eaeaea', marginBottom: '15px' }}>
                    <span style={{ fontWeight: 600 }}>ค่าขนส่ง</span>
                    <span><strong style={{ fontSize: '1.1rem' }}>{price.toFixed(2)}</strong> <span style={{ color: '#888', fontSize: '0.85rem' }}>THB</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>ค่าบริการทั้งหมด</span>
                    <span style={{ color: '#d40511' }}><strong style={{ fontSize: '1.4rem' }}>{price.toFixed(2)}</strong> <span style={{ color: '#888', fontSize: '0.85rem' }}>THB</span></span>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Package Size Bottom Sheet Modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000 }} onClick={() => setShowModal(false)}></div>
          
          {/* Modal Content */}
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', zIndex: 1001, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)' }}>
            
            <div style={{ padding: '24px 20px 20px', textAlign: 'center', position: 'relative', borderBottom: '1px solid #eaeaea' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0, marginBottom: '8px', fontWeight: 700 }}>ขนาดพัสดุ</h2>
              <p style={{ color: '#d40511', fontSize: '0.95rem', margin: 0, fontWeight: 600, padding: '0 20px' }}>จะมีการเรียกเก็บค่าใช้จ่ายเพิ่มเติมหากขนาดไม่ตรงกับพัสดุจริง</p>
              <div style={{ position: 'absolute', top: '24px', right: '20px', cursor: 'pointer' }} onClick={() => setShowModal(false)}>
                <X size={26} color="#d40511" />
              </div>
            </div>

            <div style={{ padding: '16px', overflowY: 'auto', flex: 1, backgroundColor: '#fff' }}>
              {packageSizes.map((pkg, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleSelectPackage(pkg)}
                  style={{ display: 'flex', alignItems: 'center', backgroundColor: '#fff', padding: '16px 20px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #000', cursor: 'pointer' }}>
                  <div style={{ width: '40px', marginRight: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pkg.icon}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#d40511', fontWeight: 800, fontSize: '1.1rem', marginRight: '8px' }}>{pkg.name}</span>
                    <span style={{ color: '#666', fontSize: '1rem' }}>{pkg.desc}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
