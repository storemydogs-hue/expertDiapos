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
  Settings
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
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    company: "",
    jobTitle: "",
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
            bio: data.bio || "",
            company: data.company || "",
            jobTitle: data.jobTitle || "",
          });
        } else {
          setFormData({
            ...formData,
            name: user.displayName || "",
            email: user.email || "",
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    try {
      // Update Firebase Auth profile
      if (formData.name !== user.displayName) {
        await updateProfile(user, { displayName: formData.name });
      }

      // Update Firestore data
      await setDoc(doc(db, "users", user.uid), {
        ...formData,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError("Erreur lors de la sauvegarde du profil.");
    } finally {
      setSaving(false);
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
          <button
            onClick={onBack}
            className="hidden md:flex items-center gap-2 py-2 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Settings className="w-4 h-4" />
            Paramètres avancés
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-inner object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-orange-50 border-4 border-orange-100 flex items-center justify-center">
                    <User className="w-10 h-10 text-orange-600" />
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-orange-600 text-white rounded-full shadow-lg border-2 border-white hover:bg-orange-700 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
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
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nom Complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
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
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Entreprise</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Nom de votre entreprise"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-medium"
                    />
                  </div>
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
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Biographie / À propos</label>
                  <textarea
                    rows={4}
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
                      Modifications enregistrées !
                    </motion.div>
                  )}
                  {error && (
                    <div className="text-red-500 text-xs font-bold">{error}</div>
                  )}
                </div>
                <button
                  disabled={saving}
                  type="submit"
                  className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Sauvegarder les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
