import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, User, Chrome, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { auth, googleProvider, db } from "../lib/firebase";
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { translations } from "../translations";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "login" | "signup";
  language: any; // Using any to avoid complex type for now, but it's Language
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, initialMode = "signup", language }) => {
  const t = (key: any) => {
    const lang = (translations as any)[language] || (translations as any)["FR"];
    return lang[key] || key;
  };
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Save user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
      }, { merge: true });

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      // Map common Firebase errors to user-friendly messages in French
      let userMessage = t("error_auth_failed");
      if (err.code === "auth/email-already-in-use") {
        userMessage = "Cet email est déjà utilisé. Si vous avez déjà un compte Google, essayez de vous connecter avec le bouton Google.";
      } else if (err.code === "auth/weak-password") {
        userMessage = "Le mot de passe est trop court (6 caractères min).";
      } else if (err.code === "auth/invalid-email") {
        userMessage = "Format d'email invalide.";
      } else if (err.code === "auth/operation-not-allowed") {
        userMessage = "L'inscription par email n'est pas activée. Veuillez utiliser Google.";
      } else if (err.code === "auth/unauthorized-domain") {
        userMessage = "Ce domaine n'est pas autorisé dans la console Firebase. Veuillez ajouter les URLs de l'app aux domaines autorisés dans Authentification > Paramètres.";
      } else if (err.code === "auth/network-request-failed") {
        userMessage = "Erreur réseau. Vérifiez votre connexion.";
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Safety timeout to prevent stuck loading state
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError("La session a expiré. Veuillez réessayer.");
      }
    }, 15000);

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          createdAt: serverTimestamp(),
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      clearTimeout(timeoutId);
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      let userMessage = t("error_auth_failed");
      if (err.code === "auth/email-already-in-use") {
        userMessage = "Cet email est déjà utilisé. Essayez de vous connecter ou utilisez une autre adresse.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        userMessage = "Email ou mot de passe incorrect.";
      } else if (err.code === "auth/invalid-email") {
        userMessage = "Format d'email invalide.";
      } else if (err.code === "auth/weak-password") {
        userMessage = "Le mot de passe est trop court (6 caractères min).";
      } else if (err.code === "auth/operation-not-allowed") {
        userMessage = "L'inscription par email n'est pas encore activée. Utilisez Google pour le moment.";
      }
      
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
          >
            {/* Header decor */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-600" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8">
              {success ? (
                <div className="py-12 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {mode === "signup" ? "Compte créé !" : "Session ouverte !"}
                  </h3>
                  <p className="text-slate-500 text-sm">Redirection en cours...</p>
                </div>
              ) : (
                <>
                  <div className="mb-8 text-center">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                      {mode === "signup" ? t("signup_title") : t("login_title")}
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {mode === "signup" 
                        ? "Rejoignez Expert Diapos dès aujourd'hui" 
                        : "Accédez à vos présentations intelligentes"}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "signup" && (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                          Nom complet
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            required
                            type="text"
                            placeholder={t("signup_name_placeholder")}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          required
                          type="email"
                          placeholder={t("signup_email_placeholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                        Mot de passe
                      </label>
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-xs font-medium text-center">
                        {error}
                      </p>
                    )}

                    <button
                      disabled={loading}
                      type="submit"
                      className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          {mode === "signup" ? t("signup_submit") : t("login_submit")}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="my-6 flex items-center gap-4">
                    <div className="h-px bg-slate-100 flex-1" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      OU
                    </span>
                    <div className="h-px bg-slate-100 flex-1" />
                  </div>

                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    <Chrome className="w-5 h-5 text-orange-600" />
                    {t("signup_google")}
                  </button>

                  <p className="mt-8 text-center text-sm text-slate-500">
                    {mode === "signup" ? (
                      <button 
                        onClick={() => setMode("login")}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        {t("signup_already_have_account")}
                      </button>
                    ) : (
                      <button 
                        onClick={() => setMode("signup")}
                        className="text-orange-600 font-bold hover:underline"
                      >
                        {t("login_no_account")}
                      </button>
                    )}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
