import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Camera, 
  ChevronLeft,
  Save,
  Loader2,
  CheckCircle2,
  Settings,
  Phone,
  Globe,
  MapPin,
  AlertCircle
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

interface PersonalDetailsProps {
  onBack: () => void;
  language: string;
  user: any; // Firebase User object
}

export const PersonalDetails: React.FC<PersonalDetailsProps> = ({ onBack, language, user }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    bio: "",
    company: "",
    jobTitle: "",
    photoURL: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            name: data.name || user.displayName || "",
            email: data.email || user.email || "",
            phone: data.phone || "",
            country: data.country || "",
            city: data.city || "",
            bio: data.bio || "",
            company: data.company || "",
            jobTitle: data.jobTitle || "",
            photoURL: data.photoURL || user.photoURL || "",
          });
        } else {
          setFormData({
            ...formData,
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = "Le nom est obligatoire";
    if (!formData.phone.trim()) errors.phone = "Le téléphone est obligatoire";
    if (!formData.country.trim()) errors.country = "Le pays est obligatoire";
    if (!formData.city.trim()) errors.city = "La ville est obligatoire";
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!validateForm()) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Update Firebase Auth profile
      if (formData.name !== user.displayName || formData.photoURL !== user.photoURL) {
        await updateProfile(user, { 
          displayName: formData.name,
          photoURL: formData.photoURL
        });
      }

      // Update Firestore data
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setSuccess(true);
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        setSuccess(false);
        onBack(); // Redirection vers le tableau de bord (Home view)
      }, 1500);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError("Erreur lors de la sauvegarde du profil.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate upload by creating a local URL
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, photoURL: url });
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white rounded-xl text-slate-500 hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Détails Personnels</h1>
              <p className="text-slate-500 text-sm font-medium">Gérez vos informations de compte et préférences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                {formData.photoURL ? (
                  <img src={formData.photoURL} alt="" className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-inner object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center">
                    <User className="w-10 h-10 text-orange-600" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-orange-700 transition-colors cursor-pointer">
                  <Camera className="w-3.5 h-3.5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                </label>
              </div>
              <h3 className="font-bold text-slate-900 text-lg leading-tight">{formData.name || "Utilisateur"}</h3>
              <p className="text-slate-400 text-xs font-medium mb-4">{formData.email}</p>
              
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Statut du compte</p>
                    <p className="text-xs font-bold text-slate-700">Utilisateur Gratuit</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Membre depuis</p>
                    <p className="text-xs font-bold text-slate-700">Juin 2026</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden">
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom Complet *</label>
                    <div className="relative">
                      <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${validationErrors.name ? "text-red-400" : "text-slate-400"}`} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${validationErrors.name ? "border-red-200" : "border-slate-200"} rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium`}
                      />
                    </div>
                    {validationErrors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{validationErrors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        disabled
                        type="email"
                        value={formData.email}
                        className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Téléphone *</label>
                    <div className="relative">
                      <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${validationErrors.phone ? "text-red-400" : "text-slate-400"}`} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+33 6 00 00 00 00"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${validationErrors.phone ? "border-red-200" : "border-slate-200"} rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium`}
                      />
                    </div>
                    {validationErrors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{validationErrors.phone}</p>}
                  </div>

                  {/* Job Title (Optional but present) */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Poste occupé</label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                      placeholder="Votre rôle"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Pays *</label>
                    <div className="relative">
                      <Globe className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${validationErrors.country ? "text-red-400" : "text-slate-400"}`} />
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        placeholder="Ex: France"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${validationErrors.country ? "border-red-200" : "border-slate-200"} rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium`}
                      />
                    </div>
                    {validationErrors.country && <p className="text-[10px] text-red-500 font-bold ml-1">{validationErrors.country}</p>}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Ville *</label>
                    <div className="relative">
                      <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${validationErrors.city ? "text-red-400" : "text-slate-400"}`} />
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Ex: Paris"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${validationErrors.city ? "border-red-200" : "border-slate-200"} rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium`}
                      />
                    </div>
                    {validationErrors.city && <p className="text-[10px] text-red-500 font-bold ml-1">{validationErrors.city}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Biographie / À propos</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Dites-nous en plus sur vos projets de présentations..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium resize-none"
                  />
                </div>
              </div>

              <div className="bg-slate-50/50 px-8 py-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {success && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 text-green-600 text-xs font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Informations enregistrées avec succès !
                    </motion.div>
                  )}
                  {error && (
                    <div className="flex items-center gap-1.5 text-red-500 text-xs font-bold animate-pulse">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
                <button
                  disabled={saving}
                  type="submit"
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm hover:shadow-md"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
