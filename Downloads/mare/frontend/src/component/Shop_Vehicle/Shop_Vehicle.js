import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Nav_Customer from '../Nav_Customer/Nav_Customer';
import Footer from '../Footer/Footer';
import PageWrapper from '../PageWrapper/PageWrapper';

function DisplayVehicle() {
    const [vehicle, setVehicle] = useState([]);

    useEffect(() => {
        loadVehicle();
    }, []);

    const loadVehicle = async () => {
        const result = await axios.get("http://localhost:8080/vehicle");
        setVehicle(result.data);
    };

    return (
        <PageWrapper>
            <div className="min-h-screen page-bg font-sans">

                <Nav_Customer />

      
                <div className="relative w-full h-64 overflow-hidden">
                    <img src="/automart c.jpg" alt="MARE Showroom" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-center px-4">
                        <span className="bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-3">
                            Browse Our Collection
                        </span>
                        <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
                            The Shop
                        </h1>
                        <p className="text-gray-300 text-sm mt-2">Find your perfect vehicle today</p>
                    </div>
                </div>

          
                <div className="grid grid-cols-4 gap-2 px-8 py-6">
                    {["/Tesla1.jpeg", "/Tesla2.jpeg", "/automart c.jpg", "/automart c.jpg"].map((src, i) => (
                        <div key={i} className="rounded-xl overflow-hidden h-40 shadow-md hover:shadow-xl transition-shadow duration-300">
                            <img
                                src={src}
                                alt={`Vehicle ${i + 1}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>


                <div className="px-8 pb-2 pt-2">
                    <h2 className="text-2xl font-extrabold text-main tracking-tight">Available Vehicles</h2>
                    <div className="w-16 h-1 bg-yellow-400 rounded-full mt-2 mb-6"></div>
                </div>

        
                <div className="px-8 pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vehicle.length === 0 ? (
                        <div className="col-span-4 flex flex-col items-center justify-center py-24 text-muted">
     
                            <p className="text-xl font-semibold">No vehicles available</p>
                            <p className="text-sm mt-1">Check back soon for new arrivals</p>
                        </div>
                    ) : (
                        vehicle.map((v, index) => (
                            <div
                                key={index}
                                className="card border rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                            >
                                {/* Card Top Accent */}
                                <div className="bg-black h-2 w-full"></div>

                                <div className="p-5">

                                    {/* Badge */}
                                    <span className="inline-block bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full mb-3">
                                        ID: {v.vehicleId}
                                    </span>

                                    {/* Brand & Model */}
                                    <h3 className="text-main text-xl font-extrabold">{v.brand}</h3>
                                    <p className="text-muted text-sm mb-4">{v.model}</p>

                                    {/* Details */}
                                    <div className="space-y-2 text-sm divider border-t pt-4 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-muted">Year</span>
                                            <span className="font-semibold text-main">{v.year}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted">Tax</span>
                                            <span className="font-semibold text-main">Rs. {Number(v.tax).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between divider border-t pt-2 mt-2">
                                            <span className="text-soft font-semibold">Total Price</span>
                                            <span className="font-extrabold text-main text-base">Rs. {Number(v.sellingPrice).toLocaleString()}</span>
                                        </div>
                                    </div>

                       
                                    <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-md text-sm">
                                        🚗 Buy Now
                                    </button>

                
                                    
                                <a       href="/addAppointment"
                                        className="block text-center text-muted hover:text-yellow-500 text-xs font-medium mt-3 transition-colors duration-200"
                                    >
                                        Book a Test Drive →
                                    </a>

                                </div>
                            </div>
                        ))
                    )}
                </div>

            </div>

            <Footer />
        </PageWrapper>
    );
}

export default DisplayVehicle;