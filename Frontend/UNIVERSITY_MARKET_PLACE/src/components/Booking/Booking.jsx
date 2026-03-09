import React, { useState } from 'react';

const Booking = () => {
  const [selectedService, setSelectedService] = useState('Advanced Python Programming');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const serviceData = {
    'Advanced Python Programming': { price: 8500, duration: '3-5 Business Days' },
    'Full Stack Web Development': { price: 12000, duration: '4-6 Business Days' },
    'Data Science & Machine Learning': { price: 15000, duration: '5-7 Business Days' },
    'Mobile App Development': { price: 10500, duration: '6-8 Days' },
    'Cloud Computing & DevOps': { price: 9000, duration: '4-5 Business Days' },
    'Cybersecurity Fundamentals': { price: 11000, duration: '5-7 Days' }
  };

  const platformFee = Math.round(serviceData[selectedService].price * 0.05);
  const totalAmount = serviceData[selectedService].price + platformFee;

  // Booking History Data
  const [bookingHistory, setBookingHistory] = useState([
    {
      id: 'BKG001',
      customerName: 'Dr. Sarah Johnson',
      date: '2024-03-15',
      time: '10:30 AM',
      type: 'Advanced Python Programming',
      amount: 8925,
      status: 'paid',
      attachments: [
        { 
          name: 'assignment.pdf', 
          size: '2.4 MB', 
          type: 'pdf', 
          content: 'Sample PDF content - Assignment details and requirements for Python programming course.',
          data: 'This is a sample PDF file content for demonstration purposes. In a real application, this would be actual binary data.'
        },
        { 
          name: 'requirements.docx', 
          size: '1.1 MB', 
          type: 'doc', 
          content: 'Course requirements and prerequisites document.',
          data: 'This is a sample DOC file content for demonstration purposes.'
        }
      ],
      cancellationDeadline: '2024-03-10',
      timeSlots: ['10:30 AM', '2:00 PM', '4:30 PM']
    },
    {
      id: 'BKG002',
      customerName: 'Dr. Sarah Johnson',
      date: '2024-03-20',
      time: '2:00 PM',
      type: 'Full Stack Web Development',
      amount: 12600,
      status: 'pending',
      attachments: [
        { 
          name: 'project_spec.pdf', 
          size: '3.2 MB', 
          type: 'pdf', 
          content: 'Full Stack Web Development project specifications and milestones.',
          data: 'This is a sample PDF file content for demonstration purposes.'
        }
      ],
      cancellationDeadline: '2024-03-15',
      timeSlots: ['9:00 AM', '11:30 AM', '2:00 PM', '4:00 PM']
    },
    {
      id: 'BKG003',
      customerName: 'Dr. Sarah Johnson',
      date: '2024-03-25',
      time: '9:00 AM',
      type: 'Data Science & Machine Learning',
      amount: 15750,
      status: 'paid',
      attachments: [],
      cancellationDeadline: '2024-03-20',
      timeSlots: ['9:00 AM', '1:00 PM', '3:30 PM']
    },
    {
      id: 'BKG004',
      customerName: 'Dr. Sarah Johnson',
      date: '2024-03-28',
      time: '4:30 PM',
      type: 'Mobile App Development',
      amount: 11025,
      status: 'cancelled',
      attachments: [
        { 
          name: 'app_ui.pdf', 
          size: '5.1 MB', 
          type: 'pdf', 
          content: 'Mobile app UI/UX design mockups and wireframes.',
          data: 'This is a sample PDF file content for demonstration purposes.'
        },
        { 
          name: 'wireframes.fig', 
          size: '8.4 MB', 
          type: 'fig', 
          content: 'Figma wireframes for mobile application.',
          data: 'This is a sample FIG file content for demonstration purposes.'
        },
        { 
          name: 'api_docs.pdf', 
          size: '1.8 MB', 
          type: 'pdf', 
          content: 'API documentation for backend integration.',
          data: 'This is a sample PDF file content for demonstration purposes.'
        }
      ],
      cancellationDeadline: '2024-03-23',
      timeSlots: ['10:30 AM', '2:00 PM', '4:30 PM']
    }
  ]);

  const services = [
    {
      title: 'Advanced Python Programming',
      description: 'Complete Python course covering OOP, data structures, algorithms, and real-world projects.',
      rating: 4.9,
      modules: '12 Modules',
      price: 8500,
      image: '💻'
    },
    {
      title: 'Full Stack Web Development',
      description: 'Master frontend and backend development with React, Node.js, and MongoDB.',
      rating: 4.8,
      modules: '15 Modules',
      price: 12000,
      image: '🌐'
    },
    {
      title: 'Data Science & Machine Learning',
      description: 'Learn data analysis, visualization, and ML algorithms with hands-on projects.',
      rating: 4.9,
      modules: '10 Modules',
      price: 15000,
      image: '📊'
    },
    {
      title: 'Mobile App Development',
      description: 'Build native iOS and Android apps using React Native and Flutter frameworks.',
      rating: 4.7,
      modules: '6-8 Days',
      price: 10500,
      image: '📱'
    },
    {
      title: 'Cloud Computing & DevOps',
      description: 'Master AWS, Docker, Kubernetes, and CI/CD pipelines for modern infrastructure.',
      rating: 4.8,
      modules: '11 Modules',
      price: 9000,
      image: '☁️'
    },
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Learn ethical hacking, network security, and penetration testing techniques.',
      rating: 4.8,
      modules: '5-7 Days',
      price: 11000,
      image: '🔒'
    }
  ];

  // Filter bookings based on search term and status filter
  const getFilteredBookings = () => {
    return bookingHistory.filter(booking => {
      // Search filter - check if search term matches booking ID
      const matchesSearch = searchTerm === '' || 
        booking.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredBookings = getFilteredBookings();

  // Handle attachment click
  const handleAttachmentClick = (file) => {
    setSelectedFile(file);
    setShowFilePreview(true);
  };

  // Handle download file
  const handleDownloadFile = () => {
    if (selectedFile) {
      let fileContent = '';
      let mimeType = '';
      
      switch(selectedFile.type) {
        case 'pdf':
          fileContent = `%PDF-1.4
%µµµµ
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Count 1/Kids[3 0 R]>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>>
endobj
xref
0 4
0000000000 65535 f
0000000015 00000 n
0000000060 00000 n
0000000111 00000 n
trailer
<</Size 4/Root 1 0 R>>
startxref
178
%%EOF

${selectedFile.content || 'Sample PDF content'}`;
          mimeType = 'application/pdf';
          break;
          
        case 'doc':
        case 'docx':
          fileContent = selectedFile.content || 'Sample document content';
          mimeType = 'application/msword';
          break;
          
        case 'fig':
          fileContent = selectedFile.content || 'Sample Figma file content';
          mimeType = 'application/octet-stream';
          break;
          
        default:
          fileContent = selectedFile.content || 'Sample file content';
          mimeType = 'text/plain';
      }
      
      const blob = new Blob([fileContent], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedFile.name;
      link.setAttribute('download', selectedFile.name);
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      alert(`Downloading ${selectedFile.name}...`);
    }
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'fig':
        return '🎨';
      case 'jpg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📎';
    }
  };

  // Get file color based on type
  const getFileColor = (type) => {
    switch(type) {
      case 'pdf':
        return 'from-red-500 to-red-600';
      case 'doc':
      case 'docx':
        return 'from-blue-500 to-blue-600';
      case 'fig':
        return 'from-purple-500 to-pink-500';
      case 'jpg':
      case 'png':
      case 'gif':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Handle cancellation
  const handleCancellation = (booking) => {
    setSelectedBooking(booking);
    setShowCancellationModal(true);
  };

  // Handle reschedule
  const handleReschedule = (booking) => {
    setSelectedBooking(booking);
    setShowRescheduleModal(true);
  };

  // Confirm cancellation
  const confirmCancellation = () => {
    setBookingHistory(bookingHistory.map(booking => 
      booking.id === selectedBooking.id 
        ? { ...booking, status: 'cancelled' }
        : booking
    ));
    setShowCancellationModal(false);
    setSelectedBooking(null);
    setCancellationReason('');
  };

  // Confirm reschedule
  const confirmReschedule = () => {
    setBookingHistory(bookingHistory.map(booking => 
      booking.id === selectedBooking.id 
        ? { ...booking, date: newDate, time: newTime }
        : booking
    ));
    setShowRescheduleModal(false);
    setSelectedBooking(null);
    setNewDate('');
    setNewTime('');
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1120] via-[#1a2942] to-[#0f1a2f] p-5 md:p-10 text-white relative">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-5 border-b border-white/10 mb-8">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent shadow-[0_0_20px_rgba(96,165,250,0.3)]">
          UniMarket
        </div>
        <div className="flex gap-8 items-center">
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Browse</a>
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">My Learning</a>
          <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Inbox</a>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)]">
            👤
          </div>
        </div>
      </nav>

      {/* Header Profile */}
      <div className="bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8 flex gap-6 items-center shadow-[0_8px_32px_rgba(0,0,0,0.4)] md:flex-row flex-col text-center md:text-left">
        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(59,130,246,0.5)]">
          👩‍🏫
        </div>
        <div className="profile-info">
          <h1 className="text-2xl md:text-3xl mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Dr. Sarah Johnson
          </h1>
          <div className="flex gap-3 mb-3 flex-wrap justify-center md:justify-start">
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/20 border border-amber-500 text-amber-500">
              ⭐ Top Rated Provider
            </span>
            <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/20 border border-emerald-500 text-emerald-500">
              Trust Score: 96%
            </span>
          </div>
          <div className="flex gap-5 text-slate-400 flex-wrap justify-center md:justify-start">
            <span className="flex items-center gap-1">⭐ 4.7 (342 reviews)</span>
            <span className="flex items-center gap-1">📈 156 Completed Jobs</span>
            <span className="flex items-center gap-1">🏛️ University of Colombo</span>
            <span className="flex items-center gap-1">💻 Computer Science</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex gap-3 mb-4 flex-col md:flex-row">
          <input 
            type="text" 
            placeholder="Search services" 
            className="flex-1 p-3.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl text-white text-base focus:outline-none focus:border-blue-500 focus:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all"
          />
          <select className="p-3.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl text-white cursor-pointer">
            <option>All Categories</option>
          </select>
          <select className="p-3.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl text-white cursor-pointer">
            <option>Sort by: Popular</option>
          </select>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button className="px-5 py-2.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-full text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 transition-all">
            4+ Stars
          </button>
          <button className="px-5 py-2.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-full text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 transition-all">
            Quick Delivery
          </button>
          <button className="px-5 py-2.5 bg-slate-900/60 backdrop-blur border border-white/10 rounded-full text-white hover:border-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] hover:-translate-y-0.5 transition-all">
            Price Range
          </button>
        </div>
      </div>

      {/* Main Content - Services and Booking Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 mb-10">
        {/* Left Side - Service Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl overflow-hidden hover:-translate-y-1 hover:border-blue-400 hover:shadow-[0_10px_30px_rgba(96,165,250,0.2)] transition-all cursor-pointer"
              onClick={() => setSelectedService(service.title)}
            >
              <div className="h-35 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl border-b border-white/10">
                {service.image}
              </div>
              <div className="p-5">
                <h3 className="text-lg mb-2 text-white">{service.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-3">{service.description}</p>
                <div className="flex gap-3 mb-3">
                  <span className="text-amber-400 text-sm">⭐ {service.rating}</span>
                  <span className="text-slate-400 text-sm">{service.modules}</span>
                </div>
                <div className="text-xl font-semibold text-blue-400 mb-4">
                  LKR {service.price.toLocaleString()}
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 bg-transparent border border-blue-400 rounded-xl text-blue-400 hover:bg-blue-400/10 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all">
                    Select
                  </button>
                  <button className="flex-1 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 border-none rounded-xl text-white hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] transition-all shadow-[0_4px_15px_rgba(59,130,246,0.4)]">
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Booking Summary */}
        <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 h-fit lg:sticky lg:top-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl mb-6 text-white">Booking Summary</h2>
          
          <div className="flex justify-between mb-4 text-slate-400">
            <span>Selected Service</span>
            <span className="text-blue-400 font-medium">{selectedService}</span>
          </div>
          
          <div className="flex justify-between mb-4 text-slate-400">
            <span>Service Price</span>
            <span>LKR {serviceData[selectedService].price.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mb-4 text-slate-400">
            <span>Platform Fee (5%)</span>
            <span>LKR {platformFee.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between mt-5 pt-5 border-t border-white/10 text-lg font-semibold text-white">
            <span>Total Amount</span>
            <span className="text-blue-400 text-2xl shadow-[0_0_20px_rgba(96,165,250,0.5)]">
              LKR {totalAmount.toLocaleString()}
            </span>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-500 rounded-full p-3 text-center my-6 text-emerald-500">
            ⏱️ Estimated Completion: {serviceData[selectedService].duration}
          </div>
          
          <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 border-none rounded-2xl text-white font-semibold hover:-translate-y-0.5 hover:shadow-[0_8px_25px_rgba(59,130,246,0.5)] transition-all mb-3 shadow-[0_4px_15px_rgba(59,130,246,0.4)]">
            Proceed to Booking
          </button>
          
          <button className="w-full py-4 bg-transparent border border-blue-400 rounded-2xl text-blue-400 font-semibold hover:bg-blue-400/10 hover:shadow-[0_0_20px_rgba(96,165,250,0.3)] transition-all mb-6">
            Save for Later
          </button>
          
          <div className="text-center text-slate-400 text-sm mb-6 pb-6 border-b border-white/10">
            🔒 Secure payment - 256-bit SSL encrypted
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-slate-900/60 backdrop-blur border border-white/10 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all">
              💬 Chat with Provider
            </button>
            <button className="p-3 bg-slate-900/60 backdrop-blur border border-white/10 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-400 hover:shadow-[0_0_20px_rgba(96,165,250,0.2)] transition-all">
              📞 Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Booking History Section */}
      <div className="bg-slate-900/60 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Booking History
          </h2>
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm cursor-pointer hover:border-blue-400 transition-all"
            >
              <option value="all">All Bookings</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input 
              type="text" 
              placeholder="Search by Booking ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-slate-400">
          Showing {filteredBookings.length} of {bookingHistory.length} bookings
        </div>

        {/* Booking History Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Booking ID</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Customer Name</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Date & Time</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Booking Type</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Amount</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Attachments</th>
                <th className="text-left py-3 px-2 text-slate-400 font-medium text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-2">
                      <span className="font-mono text-sm text-blue-400">{booking.id}</span>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-sm">
                          👤
                        </div>
                        <span className="text-sm">{booking.customerName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="text-sm">
                        <div>{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-slate-400 text-xs">{booking.time}</div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm">{booking.type}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-sm font-medium">LKR {booking.amount.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-2">
                      <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      {booking.attachments.length > 0 ? (
                        <div className="flex -space-x-2">
                          {booking.attachments.slice(0, 3).map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAttachmentClick(file)}
                              className="w-8 h-8 bg-slate-800 rounded-lg border-2 border-slate-700 flex items-center justify-center text-xs hover:z-10 hover:border-blue-400 hover:scale-110 transition-all cursor-pointer group relative"
                              title={`Click to preview ${file.name}`}
                            >
                              <span className="text-sm">{getFileIcon(file.type)}</span>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white/10">
                                {file.name} ({file.size})
                              </span>
                            </button>
                          ))}
                          {booking.attachments.length > 3 && (
                            <div className="w-8 h-8 bg-slate-800 rounded-lg border-2 border-slate-700 flex items-center justify-center text-xs hover:border-blue-400 transition-all cursor-pointer group relative"
                                 onClick={() => alert(`${booking.attachments.length - 3} more files available`)}>
                              <span className="text-xs font-medium">+{booking.attachments.length - 3}</span>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 border border-white/10">
                                {booking.attachments.length - 3} more files
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">No files</span>
                      )}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex gap-2">
                        {booking.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleReschedule(booking)}
                              className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-all hover:scale-110"
                              title="Reschedule"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleCancellation(booking)}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-all hover:scale-110"
                              title="Cancel Booking"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 bg-slate-700/50 hover:bg-slate-700 rounded-lg text-slate-400 transition-all hover:scale-110"
                          title="View Details"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400">
                    No bookings found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreview && selectedFile && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFileColor(selectedFile.type)} flex items-center justify-center text-2xl`}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedFile.name}</h3>
                  <p className="text-sm text-slate-400">{selectedFile.size}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFilePreview(false)}
                className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            {/* File Preview Content */}
            <div className="bg-slate-800/50 rounded-xl p-6 mb-6 border border-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getFileColor(selectedFile.type)} flex items-center justify-center text-3xl`}>
                  {getFileIcon(selectedFile.type)}
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-slate-700 rounded-full w-full mb-2">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-xs text-slate-400">Ready to download</p>
                </div>
              </div>
              
              {/* File Info */}
              <div className="bg-slate-900/50 rounded-lg p-4 text-sm text-slate-300 border border-white/5">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>File Information:</span>
                </div>
                <div className="space-y-2">
                  <p className="text-slate-400">
                    <span className="text-slate-500">Name:</span> {selectedFile.name}
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">Size:</span> {selectedFile.size}
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">Type:</span> {selectedFile.type.toUpperCase()}
                  </p>
                  <p className="text-slate-400">
                    <span className="text-slate-500">Description:</span> {selectedFile.content}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 text-xs text-slate-500">
                  <span>Uploaded: {new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDownloadFile}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download File
              </button>
              <button
                onClick={() => setShowFilePreview(false)}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancellationModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Cancel Booking</h3>
            <p className="text-slate-400 text-sm mb-4">
              Are you sure you want to cancel booking <span className="text-blue-400 font-mono">{selectedBooking.id}</span>?
            </p>
            
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400 text-xs">
                ⚠️ Cancellation deadline: {new Date(selectedBooking.cancellationDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">Reason for cancellation (optional)</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please provide a reason..."
                className="w-full p-3 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400 resize-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancellationModal(false)}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancellation}
                className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl hover:from-red-600 hover:to-rose-600 transition-all shadow-lg shadow-red-500/20"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Reschedule Booking</h3>
            <p className="text-slate-400 text-sm mb-4">
              Select new date and time for booking <span className="text-blue-400 font-mono">{selectedBooking.id}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-3 bg-slate-800/60 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">Select a time slot</option>
                  {selectedBooking.timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!newDate || !newTime}
                className={`flex-1 py-3 rounded-xl transition-all ${
                  newDate && newTime
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg shadow-blue-500/20'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;