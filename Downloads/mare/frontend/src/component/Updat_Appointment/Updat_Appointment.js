import React,{useEffect , useState} from 'react';
import { useParams , useNavigate } from 'react-router-dom';
import axios from "axios";
import Nav_Customer from '../Nav_Customer/Nav_Customer';
import Footer from '../Footer/Footer';


function Updat_Appointment() {

const { id} = useParams();
const navigate = useNavigate();

const [formData , setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    branch: "",
    appointmentDate: "",
    purpose: "",
    vehicleId: "",
    vehicleModel: "",
    status: ""

});
const onSubmit = async (e)=>{
    e.preventDefault();

    try {
        await axios.put(`http://localhost:8080/appointment/${id}`, formData, {
            headers: { "Content-Type": "application/json" },
        });
    

    alert("Appointment updated!");
    navigate("/userProfile");
  } catch (err) {
    console.error("Update error:", err);
    alert("Update failed");
  }
};

const [ loading , setLoading]= useState(true);

useEffect(()=>{

    axios.get (`http://localhost:8080/appointment/${id}`).then((res)=> {
        setFormData(res.data);
        setLoading(false);

    }).catch((err)=> {
        console.error("error loading appointment",err);
        setLoading(false);
    })
},[id]

);

if (loading) return <p>Appointments load wenawaaaaaa...</p>;
const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white transition";
const labelClass = "block text-sm font-semibold text-gray-600 mb-1";

const onInputChange = (e) =>{
    setFormData({...formData,[e.target.name]: e.target.value});

    const onSubmit = async (e) => {
        e.preventDefault();

        try{
            await axios.put(`http://localhost:8080/appointment/${id}`, formData,{
                headers: {"Content-Type":"application/json"},

            });
            alert("Appointment details upadated");
            navigate("/userprofile");


        }
        catch(error){
            console.error("update error ekak:",error);
            alert("update une na ");
        }
    }
};

  return (
    <div>
<Nav_Customer/>

<div  className="relative min-h-screen flex items-center justify-center px-4 py-16"
        style={{
          backgroundImage: "url('/automart c.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}> 

<div className="absolute inset-0 bg-black bg-opacity-50"></div>
<div className="relative z-10 w-full max-w-2xl">
<div className="text-center mb-6">
            <span className="bg-yellow-400 text-black text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-full inline-block mb-3">
           Want to change your booking?
            </span>
          </div>
      <h1 className="text-white text-4xl font-extrabold tracking-tight"> Update Your Appointment </h1>
      <p className="text-gray-300 text-sm mt-2">Fill in your details and we'll confirm your slot shortly</p>

      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

<form onSubmit={onSubmit} className="p-8 space-y-5">

 <div>
 <label className={labelClass}>Full Name</label>
<input type="text" name="name" value={formData.name} onChange={onInputChange} className={inputClass} />
 </div>

<div>
 <label className={labelClass}>Phone Number</label>
<input type="text" name="name" value={formData.phone} onChange={onInputChange} className={inputClass} />
 </div>

<div>
 <label className={labelClass}>Email Address</label>
<input type="text" name="name" value={formData.email} onChange={onInputChange} className={inputClass} />
 </div>
    <div className="grid grid-cols-2 gap-4">
    <div>
  <label className={labelClass}>Nearest Branch</label>
  <select name="branch" value={formData.branch} onChange={onInputChange} required className={inputClass}>
                    <option value="">Select branch</option>
                    <option value="Colombo">Colombo</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Negambo">Negambo</option>
                    <option value="Galle">Galle</option>
                    <option value="Batticaloa">Batticaloa</option>
                    <option value="Jaffna">Jaffna</option>
                  </select>
 </div>
</div>

<div>
<label className={labelClass}>Appointment Date</label>
<input type="date" name="appointmentDate" value={formData.appointmentDate} onChange={onInputChange} required className={inputClass} />
</div>

<div>
                <label className={labelClass}>Purpose</label>
                <select name="purpose" value={formData.purpose} onChange={onInputChange} required className={inputClass}>
                  <option value="">Select Purpose</option>
                  <option value="Test Drive">Test Drive</option>
                  <option value="Vehicle Inspection">Vehicle Inspection</option>
                  <option value="Finance Discussion">Finance Discussion</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Vehicle ID <span className="text-gray-400 font-normal"></span></label>
                  <input type="text" name="vehicleId" value={formData.vehicleId} onChange={onInputChange} className={inputClass} />
                </div>
                <div>
                <label className={labelClass}>Vehicle Model <span className="text-gray-400 font-normal"></span></label>
                  <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={onInputChange} className={inputClass} />
                </div>
              </div>


              <div>
                <label className={labelClass}>Additional Note</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={onInputChange}
                  rows={3}
                  className={inputClass}
                ></textarea>
              </div>

    <button type="submit"   className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-extrabold py-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-md text-sm tracking-wide">Update</button>
  </form>
  </div>
  </div>
  </div>
  <Footer/>
    </div>
  )
}

export default Updat_Appointment