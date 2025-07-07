'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiKey, FiUser, FiLogOut, FiCode, FiPlay, FiCopy, FiEye, FiDownload, FiSearch, FiTool, FiZap, FiPackage, FiBookOpen, FiLock, FiStar, FiFileText, FiTerminal } from 'react-icons/fi';
import { FaDove } from "react-icons/fa6";
import { BiCode, BiStats } from 'react-icons/bi';
import { AiOutlineApi } from 'react-icons/ai';
import Swal from 'sweetalert2';
import { config, updateStatistics, updateVisitors } from '../config.js';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [activeTab, setActiveTab] = useState('test');
  const [testParams, setTestParams] = useState({});
  const [testResponse, setTestResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visitors, setVisitors] = useState(0);
  const [responseObjectUrl, setResponseObjectUrl] = useState(null);

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });

  useEffect(() => {
    setTimeout(() => {
        const savedApiKey = localStorage.getItem('apiKey');
        if (savedApiKey) {
          handleLogin(savedApiKey, true);
        }
        updateVisitors();
        setVisitors(config.statistics.visitors.total);
    }, 1500);
  }, []);
  
  useEffect(() => {
    if (selectedEndpoint) {
        const loggedInApiKey = localStorage.getItem('apiKey');
        setTestParams({ apikey: loggedInApiKey });
        setTestResponse(null);
        setActiveTab('test');
    }
  }, [selectedEndpoint]);

  useEffect(() => {
    return () => {
      if (responseObjectUrl) {
        URL.revokeObjectURL(responseObjectUrl);
      }
    };
  }, [responseObjectUrl]);

  const handleLogin = async (apiKey, isSilent = false) => {
    if (config.apiKeys[apiKey]) {
      const user = config.apiKeys[apiKey];
      if (user.isActive) {
        localStorage.setItem('apiKey', apiKey);
        setIsAuthenticated(true);
        setUserRole(user.type);
        setCurrentUser(user);
        setShowLogin(false);
        if (!isSilent) {
          Toast.fire({
            icon: 'success',
            title: `Login Berhasil, ${user.name}!`
          });
        }
      } else {
        localStorage.removeItem('apiKey');
        if (!isSilent) {
            Toast.fire({
                icon: 'error',
                title: 'Akses ditolak: API Key dinonaktifkan.'
            });
        }
      }
    } else {
      if (!isSilent) {
        Toast.fire({
          icon: 'error',
          title: 'API Key yang Anda masukkan tidak valid.'
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setIsAuthenticated(false);
    setUserRole(null);
    setCurrentUser(null);
    setSelectedEndpoint(null);
    setTestResponse(null);
    Toast.fire({
        icon: 'info',
        title: 'Anda telah logout.'
    });
  };

  const handleTestEndpoint = async () => {
    const loggedInApiKey = localStorage.getItem('apiKey');

    if (userRole !== 'owner' && userRole !== 'admin' && currentUser.monthlyLimit && currentUser.requestCount >= currentUser.monthlyLimit) {
        Toast.fire({
            icon: 'error',
            title: `Batas permintaan bulanan Anda (${currentUser.monthlyLimit}) telah tercapai.`
        });
        return;
    }

    const requiredParams = selectedEndpoint.parameters.filter(p => p.required);
    const missingParams = requiredParams.filter(p => !testParams[p.name]);
    if (missingParams.length > 0) {
        Toast.fire({
            icon: 'warning',
            title: `Harap isi parameter berikut: ${missingParams.map(p => p.name).join(', ')}`
        });
        return;
    }
    
    if (testParams.apikey !== loggedInApiKey) {
        Toast.fire({
            icon: 'error',
            title: 'Gunakan API Key yang sama dengan yang Anda pakai untuk login.'
        });
        return;
    }
    
    setIsLoading(true);
    setTestResponse(null);
    if (responseObjectUrl) {
      URL.revokeObjectURL(responseObjectUrl);
      setResponseObjectUrl(null);
    }

    try {
      const queryParams = new URLSearchParams();
      const bodyParams = {};
      let fetchUrl = selectedEndpoint.path;
      const fetchOptions = {
        method: selectedEndpoint.method,
        headers: {}
      };

      selectedEndpoint.parameters.forEach(param => {
        const value = testParams[param.name];
        if (!value) return;
        if (selectedEndpoint.method === 'POST' && param.in === 'body') {
          bodyParams[param.name] = value;
        } else {
          queryParams.append(param.name, value);
        }
      });

      if (queryParams.toString()) {
        fetchUrl += `?${queryParams.toString()}`;
      }

      if (selectedEndpoint.method === 'POST' && Object.keys(bodyParams).length > 0) {
        fetchOptions.headers['Content-Type'] = 'application/json';
        fetchOptions.body = JSON.stringify(bodyParams);
      }
      
      const response = await fetch(fetchUrl, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Terjadi kesalahan tidak dikenal pada server.' }));
        throw new Error(errorData.message);
      }

      const contentType = response.headers.get('content-type');
      let responseData;
      let responseType = 'json';

      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.blob();
        responseType = 'blob';
        setResponseObjectUrl(URL.createObjectURL(responseData));
      }
      
      setTestResponse({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        type: responseType
      });
      
      updateStatistics(selectedEndpoint.id, loggedInApiKey);
      setCurrentUser(prevUser => ({ ...prevUser, requestCount: prevUser.requestCount + 1 }));
      
      Toast.fire({
        icon: 'success',
        title: 'Tes Berhasil! Respons diterima.'
      });

    } catch (error) {
      setTestResponse({ error: error.message });
      Toast.fire({
        icon: 'error',
        title: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    Toast.fire({
      icon: 'success',
      title: 'Tersalin ke clipboard!'
    });
  };

  const downloadBlob = () => {
    if (!responseObjectUrl) return;
    const link = document.createElement('a');
    link.href = responseObjectUrl;
    const contentType = testResponse.headers['content-type'];
    const extension = contentType ? contentType.split('/')[1] : 'dat';
    link.download = `respons-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const LoginModal = () => (
    <AnimatePresence>
      {showLogin && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowLogin(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect p-8 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <FiKey className="text-4xl text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Otentikasi API Key</h2>
              <p className="text-gray-300">Masukkan API Key Anda untuk mengakses hub</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLogin(e.target.apikey.value);
            }}>
              <input
                type="password"
                name="apikey"
                placeholder="Masukkan API Key Anda"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Masuk
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
  
  const FeatureCard = ({ icon: Icon, title, description }) => (
    <motion.div 
      className="glass-effect p-6 text-center hover-glow"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
          <Icon className="text-2xl text-white" />
        </div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
  
  const Footer = () => (
    <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center p-4 mt-8 text-gray-500 text-sm"
    >
        <p>&copy; {new Date().getFullYear()} {config.site.author}. Seluruh Hak Cipta.</p>
    </motion.footer>
  );

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <motion.div whileHover={{ scale: 1.05 }} className="glass-effect p-6 hover-glow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className={`text-3xl ${color}`} />
      </div>
    </motion.div>
  );

  const EndpointCard = ({ endpoint }) => {
    const isMt = endpoint.mt;
    const isPremium = endpoint.accessLevel === 'premium';
    const isUserRegular = userRole === 'user';
    const insufficientAccess = isPremium && isUserRegular;
    const isUnderMaintenance = isMt && userRole !== 'owner';
    
    const cardClasses = (isUnderMaintenance || insufficientAccess)
      ? "glass-effect p-6 bg-gray-800/50 opacity-60 cursor-not-allowed"
      : "glass-effect p-6 cursor-pointer hover-glow";

    const handleClick = () => {
        if (isUnderMaintenance) {
            Toast.fire({
                icon: 'info',
                title: 'Endpoint ini sedang dalam perbaikan.'
            });
        } else if (insufficientAccess) {
             Toast.fire({
                icon: 'warning',
                title: 'Akses ditolak: Fitur ini hanya untuk Premium.'
            });
        } else {
            setSelectedEndpoint(endpoint);
        }
    };

    return (
        <motion.div
            whileHover={!(isUnderMaintenance || insufficientAccess) ? { scale: 1.02 } : {}}
            whileTap={!(isUnderMaintenance || insufficientAccess) ? { scale: 0.98 } : {}}
            className={cardClasses}
            onClick={handleClick}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${(isUnderMaintenance || insufficientAccess) ? 'bg-gray-600' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                        {isUnderMaintenance ? <FiTool className="text-white" /> : (insufficientAccess ? <FiLock className="text-white"/> : <FiCode className="text-white" />)}
                    </div>
                    <div>
                        <h3 className="font-semibold">{endpoint.name}</h3>
                        <p className="text-sm text-gray-400">{endpoint.method} {endpoint.path}</p>
                    </div>
                </div>
                {isUnderMaintenance ? (
                    <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">Perbaikan</span>
                ) : isMt && userRole === 'owner' ? (
                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded-full">Owner Bypass</span>
                ) : (
                    <span className={`text-xs px-2 py-1 rounded-full ${endpoint.accessLevel === 'premium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-purple-500/20 text-purple-300'}`}>{endpoint.accessLevel}</span>
                )}
            </div>
            <p className="text-gray-300 text-sm mb-4">{endpoint.description}</p>
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Respons: {endpoint.responseType}</span>
                {!(isUnderMaintenance || insufficientAccess) && <FiPlay className="text-purple-400" />}
            </div>
        </motion.div>
    );
  };

  const CodeSnippet = ({ code }) => (
    <div className="relative bg-black/30 p-4 rounded-lg">
      <button onClick={() => copyToClipboard(code)} className="absolute top-2 right-2 text-purple-400 hover:text-purple-300 transition-colors"><FiCopy /></button>
      <pre className="text-sm font-mono overflow-x-auto text-white">
        <code>{code}</code>
      </pre>
    </div>
  );

  const ResponseRenderer = () => {
    if (!testResponse || (!testResponse.data && !testResponse.error)) return null;

    if (testResponse.error) {
      return (
        <pre className="bg-red-900/50 text-red-300 p-4 rounded-lg text-sm font-mono overflow-x-auto">
          {testResponse.error}
        </pre>
      );
    }

    if (testResponse.type === 'json') {
      return (
        <>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold">Respons JSON</h4>
            <button onClick={() => copyToClipboard(JSON.stringify(testResponse.data, null, 2))} className="text-purple-400 hover:text-purple-300 transition-colors"><FiCopy /></button>
          </div>
          <pre className="bg-black/30 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            {JSON.stringify(testResponse.data, null, 2)}
          </pre>
        </>
      );
    }
    
    if (testResponse.type === 'blob' && responseObjectUrl) {
      const contentType = testResponse.headers['content-type'];
      return (
        <div>
          <h4 className="font-semibold mb-2">Respons Blob</h4>
          <div className="bg-black/30 p-4 rounded-lg space-y-4">
            {contentType.startsWith('image/') && (
              <img src={responseObjectUrl} alt="Respons API" className="max-w-full h-auto rounded-md" />
            )}
            {contentType.startsWith('audio/') && (
              <audio controls src={responseObjectUrl} className="w-full">Browser Anda tidak mendukung elemen audio.</audio>
            )}
            {contentType.startsWith('video/') && (
              <video controls src={responseObjectUrl} className="max-w-full h-auto rounded-md">Browser Anda tidak mendukung elemen video.</video>
            )}
            <button onClick={downloadBlob} className="flex items-center gap-2 w-full justify-center bg-purple-500/50 text-white py-2 rounded-lg font-semibold hover:bg-purple-500/80 transition-all duration-300">
              <FiDownload /> Unduh File ({testResponse.data.size} bytes)
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isAuthenticated) {
    const features = [
        { icon: FiZap, title: 'Cepat & Andal', description: 'Infrastruktur kami memastikan respons API yang cepat dan waktu aktif yang tinggi.' },
        { icon: FiPackage, title: 'Beragam Endpoint', description: 'Dari media sosial hingga AI, kami menyediakan berbagai endpoint untuk semua kebutuhan Anda.' },
        { icon: FiBookOpen, title: 'Dokumentasi Jelas', description: 'Setiap endpoint dilengkapi dengan dokumentasi yang mudah diikuti dan alat uji coba langsung.' }
    ];

    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="text-8xl mb-8 text-purple-400">
              <FaDove className="mx-auto" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
              {config.site.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">{config.site.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatsCard title="Total Endpoint" value={config.endpoints.length} icon={AiOutlineApi} color="text-purple-400" />
              <StatsCard title="Pengguna Aktif" value={Object.keys(config.apiKeys).length} icon={FiUser} color="text-pink-400" />
              <StatsCard title="Pengunjung" value={visitors} icon={FiEye} color="text-blue-400" />
            </div>
            <div className="my-16 md:my-24">
                <h2 className="text-3xl font-bold mb-10">Mengapa Memilih {config.site.name}?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowLogin(true)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
              <FiKey className="inline mr-2" /> Akses {config.site.name}
            </motion.button>
          </motion.div>
          <LoginModal />
        </div>
        <Footer />
      </>
    );
  }

  const groupedEndpoints = config.endpoints.reduce((acc, endpoint) => {
    const category = endpoint.category || 'Lainnya';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(endpoint);
    return acc;
  }, {});

  return (
    <>
      <div className="min-h-screen">
        <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-effect m-4 p-4 sticky top-4 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaDove className="text-3xl text-purple-400" />
              <h1 className="text-2xl font-bold">{config.site.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${userRole === 'owner' ? 'bg-cyan-400' : userRole === 'admin' ? 'bg-red-500' : userRole === 'premium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                <span className="text-sm">{currentUser?.name} ({userRole})</span>
              </div>
              <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors"><FiLogOut className="text-xl" /></button>
            </div>
          </div>
        </motion.header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-effect p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BiCode className="text-purple-400" /> Endpoint yang Tersedia</h2>
              <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
                {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold mb-3 text-purple-300 capitalize border-b border-purple-500/20 pb-2">{category}</h3>
                    <div className="space-y-4 pt-2">
                      {endpoints.map((endpoint) => (
                        <EndpointCard key={endpoint.id} endpoint={endpoint} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            {selectedEndpoint && (
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-effect p-6" id="test-section">
                <div className="flex border-b border-white/10 mb-6">
                  <button onClick={() => setActiveTab('test')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'test' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}><FiPlay/> Uji Coba</button>
                  <button onClick={() => setActiveTab('docs')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'docs' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}><FiFileText/> Dokumentasi</button>
                  <button onClick={() => setActiveTab('code')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'code' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}><FiTerminal/> Contoh Kode</button>
                </div>
                
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {activeTab === 'test' && (
                      <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">Uji Coba {selectedEndpoint.name}</h3>
                        <div className="space-y-4 mb-6">
                          {selectedEndpoint.parameters.map((param) => (
                            <div key={param.name}>
                              <label className="block text-sm font-medium mb-2">{param.name} {param.required && <span className="text-red-400">*</span>}</label>
                              <input 
                                type={param.name === 'apikey' ? 'password' : 'text'}
                                placeholder={param.description} 
                                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 read-only:bg-white/5 read-only:cursor-not-allowed" 
                                value={testParams[param.name] || ''}
                                readOnly={param.name === 'apikey'}
                                onChange={(e) => setTestParams({ ...testParams, [param.name]: e.target.value })} 
                              />
                            </div>
                          ))}
                        </div>
                        <button onClick={handleTestEndpoint} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                          {isLoading ? 'Menguji...' : `Uji Endpoint ${selectedEndpoint.method}`}
                        </button>
                        <div className="mt-6">
                          <ResponseRenderer />
                        </div>
                      </div>
                    )}
                    {activeTab === 'docs' && (
                       <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                          <h3 className="text-xl font-bold text-white mb-2">{selectedEndpoint.name}</h3>
                          <h4 className="font-semibold text-white">Deskripsi Lengkap</h4>
                          <p>{selectedEndpoint.documentation || 'Tidak ada dokumentasi tambahan.'}</p>
                          <h4 className="font-semibold text-white mt-4">Catatan</h4>
                          <p className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">{selectedEndpoint.notes || 'Tidak ada catatan.'}</p>
                        </div>
                    )}
                    {activeTab === 'code' && (
                      <div className="space-y-6">
                        <h3 className="text-xl font-bold text-white mb-2">Contoh Penggunaan</h3>
                        <div>
                          <h4 className="font-semibold mb-2">cURL</h4>
                          <CodeSnippet code={selectedEndpoint.usage?.curl || 'Contoh cURL tidak tersedia.'} />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">JavaScript (Fetch)</h4>
                          <CodeSnippet code={selectedEndpoint.usage?.javascript || 'Contoh JavaScript tidak tersedia.'} />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </div>
          <div className="space-y-6">
            <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass-effect p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BiStats className="text-purple-400" /> Statistik</h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-500/20 rounded-lg">
                  <p className="text-sm text-purple-300">Total Permintaan</p>
                  <p className="text-2xl font-bold">{config.statistics.totalRequests}</p>
                </div>
                <div className="p-4 bg-pink-500/20 rounded-lg">
                  <p className="text-sm text-pink-300">Permintaan Anda</p>
                  <p className="text-2xl font-bold">{currentUser?.requestCount || 0}</p>
                </div>
                <div className="p-4 bg-blue-500/20 rounded-lg">
                  <p className="text-sm text-blue-300">Batas Bulanan</p>
                  <p className="text-2xl font-bold">{currentUser?.monthlyLimit || 'Tak Terbatas'}</p>
                </div>
              </div>
              {(userRole === 'admin' || userRole === 'owner') && (
                <div className={`mt-6 p-4 rounded-lg ${userRole === 'owner' ? 'bg-cyan-500/20' : 'bg-red-500/20'}`}>
                  <h3 className={`font-semibold mb-2 flex items-center gap-2 ${userRole === 'owner' ? 'text-cyan-300' : 'text-red-300'}`}>
                    <FiStar /> {userRole === 'owner' ? 'Panel Owner' : 'Panel Admin'}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {userRole === 'owner' 
                      ? 'Anda memiliki akses absolut ke seluruh sistem.' 
                      : 'Anda memiliki akses penuh ke semua fitur.'
                    }
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
