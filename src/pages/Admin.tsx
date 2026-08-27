import { useState, useEffect, type FormEvent } from 'react';
import { Shield, UserCog, Users, Search, Plus, Trash2, Crown, FileText, Newspaper, Edit, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

type Tab = 'users' | 'policies' | 'news';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  district: string;
  role: 'assembly' | 'minister';
  created_at: string;
}

interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface GhanaNews {
  id: string;
  title: string;
  description: string;
  image_url: string;
  source: string;
  published_date: string;
  created_at: string;
}

const DISTRICTS = [
  // Greater Accra Region
  'Accra Metropolitan',
  'Tema Metropolitan',
  'Adenta Municipal',
  'Ashaiman Municipal',
  'La Nkwantanang Madina Municipal',
  'Ledzokuku Municipal',
  'Kpone-Katamanso Municipal',
  'Ga Central Municipal',
  'Ga East Municipal',
  'Ga North Municipal',
  'Ga South Municipal',
  'Ga West Municipal',
  'Weija-Gbawe Municipal',
  'Ablekuma North Municipal',
  'Ablekuma Central Municipal',
  'Ablekuma West Municipal',
  'Ayawaso Central Municipal',
  'Ayawaso East Municipal',
  'Ayawaso North Municipal',
  'Ayawaso West Municipal',
  'Okaikwei Central Municipal',
  'Okaikwei North Municipal',
  'Korle Klottey Municipal',
  'Shai Osudoku',
  'Ningo Prampram',
  'Ada East',
  'Ada West',
  'Krowor Municipal',
  'Amasaman Municipal',
  'Trobu Municipal',
  
  // Ashanti Region
  'Kumasi Metropolitan',
  'Obuasi Municipal',
  'Ejisu Municipal',
  'Asokore Mampong Municipal',
  'Afigya Kwabre South',
  'Afigya Kwabre North',
  'Atwima Kwanwoma',
  'Atwima Mponua',
  'Atwima Nwabiagya Municipal',
  'Atwima Nwabiagya North',
  'Bekwai Municipal',
  'Bosome Freho',
  'Bosomtwe',
  'Ejura Sekyedumase Municipal',
  'Juaben Municipal',
  'Kwabre East Municipal',
  'Kwadaso Municipal',
  'Mampong Municipal',
  'Offinso Municipal',
  'Offinso North',
  'Old Tafo Municipal',
  'Oforikrom Municipal',
  'Suame Municipal',
  
  // Western Region
  'Sekondi-Takoradi Metropolitan',
  'Tarkwa-Nsuaem Municipal',
  'Effia-Kwesimintsim Municipal',
  'Shama',
  'Ahanta West Municipal',
  'Wassa East',
  'Prestea Huni Valley Municipal',
  'Ellembelle',
  'Nzema East Municipal',
  
  // Central Region
  'Cape Coast Metropolitan',
  'Komenda Edina Eguafo Abirem Municipal',
  'Abura Asebu Kwamankese',
  'Mfantsiman Municipal',
  'Agona East',
  'Agona West Municipal',
  'Awutu Senya East Municipal',
  'Awutu Senya West',
  'Effutu Municipal',
  'Gomoa East',
  'Gomoa West',
  'Asikuma Odoben Brakwa',
  'Assin Central Municipal',
  'Assin North Municipal',
  'Assin South',
  'Twifo Atti-Morkwa',
  'Upper Denkyira East Municipal',
  'Upper Denkyira West',
  
  // Eastern Region
  'New Juaben Municipal',
  'New Juaben South Municipal',
  'Akuapem North Municipal',
  'Akuapem South',
  'Suhum Municipal',
  'Nsawam Adoagyire Municipal',
  'Ayensuano',
  'Fanteakwa North',
  'Fanteakwa South',
  'Kwahu East',
  'Kwahu South',
  'Kwahu West Municipal',
  'Kwahu Afram Plains North',
  'Kwahu Afram Plains South',
  'Atiwa East',
  'Atiwa West',
  'Akyemansa',
  'Birim Central Municipal',
  'Birim North',
  'Birim South',
  'Denkyembour',
  'West Akim Municipal',
  'Yilo Krobo Municipal',
  'Lower Manya Krobo Municipal',
  'Upper Manya Krobo',
  'Asuogyaman',
  
  // Volta Region
  'Ho Municipal',
  'Hohoe Municipal',
  'Keta Municipal',
  'Ketu North Municipal',
  'Ketu South Municipal',
  'Akatsi North',
  'Akatsi South',
  'Adaklu',
  'Afadjato South',
  'Agotime Ziope',
  'North Dayi',
  'South Dayi',
  'Central Tongu',
  'North Tongu',
  'South Tongu',
  'Anloga',
  'Kpando Municipal',
  'Biakoye',
  'Jasikan',
  'Kadjebi',
  'Krachi East',
  'Krachi Nchumuru',
  'Krachi West',
  'Nkwanta North',
  'Nkwanta South Municipal',
  
  // Northern Region
  'Tamale Metropolitan',
  'Yendi Municipal',
  'Zabzugu',
  'Tatale Sanguli',
  'Gushegu Municipal',
  'Karaga',
  'Kumbungu',
  'Mion',
  'Nanumba North Municipal',
  'Nanumba South',
  'Saboba',
  'Sagnarigu Municipal',
  'Savelugu Municipal',
  'Tolon',
  'Kpandai',
  'Bunkpurugu Nakpanduri',
  'Yunyoo Nasuan',
  'Mamprugu Moagduri',
  'East Mamprusi Municipal',
  'West Mamprusi Municipal',
  
  // Upper East Region
  'Bolgatanga Municipal',
  'Bawku Municipal',
  'Bawku West',
  'Binduri',
  'Bongo',
  'Builsa North Municipal',
  'Builsa South',
  'Garu',
  'Kassena Nankana Municipal',
  'Kassena Nankana West',
  'Nabdam',
  'Pusiga',
  'Talensi',
  'Tempane',
  
  // Upper West Region
  'Wa Municipal',
  'Daffiama Bussie Issa',
  'Jirapa Municipal',
  'Lambussie Karni',
  'Lawra Municipal',
  'Nadowli Kaleo',
  'Nandom Municipal',
  'Sissala East Municipal',
  'Sissala West',
  'Wa East',
  'Wa West',
  
  // Bono Region
  'Sunyani Municipal',
  'Berekum Municipal',
  'Dormaa Central Municipal',
  'Dormaa East',
  'Dormaa West',
  'Jaman North',
  'Jaman South Municipal',
  'Tain',
  'Banda',
  'Wenchi Municipal',
  
  // Bono East Region
  'Techiman Municipal',
  'Techiman North',
  'Kintampo North Municipal',
  'Kintampo South',
  'Nkoranza North',
  'Nkoranza South Municipal',
  'Atebubu Amantin Municipal',
  'Pru East',
  'Pru West',
  'Sene East',
  'Sene West',
  
  // Ahafo Region
  'Goaso Municipal',
  'Asunafo North Municipal',
  'Asunafo South',
  'Asutifi North',
  'Asutifi South',
  'Tano North Municipal',
  
  // Oti Region
  'Jasikan',
  'Kadjebi',
  'Krachi East Municipal',
  'Krachi Nchumuru',
  'Krachi West',
  'Nkwanta North',
  'Nkwanta South Municipal',
  'Biakoye',
  
  // North East Region
  'Nalerigu Gambaga Municipal',
  'Bunkpurugu Nakpanduri',
  'Yunyoo Nasuan',
  'East Mamprusi Municipal',
  'West Mamprusi Municipal',
  'Mamprugu Moagduri',
  
  // Savannah Region
  'Damongo Municipal',
  'Bole',
  'Central Gonja',
  'East Gonja Municipal',
  'North Gonja',
  'Sawla Tuna Kalba',
  'West Gonja Municipal',
].sort();

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [showUserForm, setShowUserForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState(DISTRICTS[0]);
  const [role, setRole] = useState<'assembly' | 'minister'>('assembly');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Policies state
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyDescription, setPolicyDescription] = useState('');
  const [policyCategory, setPolicyCategory] = useState('');
  const [policyStatus, setPolicyStatus] = useState<'draft' | 'active' | 'archived'>('active');
  
  // News state
  const [newsList, setNewsList] = useState<GhanaNews[]>([]);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [editingNews, setEditingNews] = useState<GhanaNews | null>(null);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsDescription, setNewsDescription] = useState('');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsSource, setNewsSource] = useState('');
  const [newsPublishedDate, setNewsPublishedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check for super admin authentication - use state to prevent re-checking
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    return sessionStorage.getItem('superAdminAuth') === 'true';
  });

  // Redirect to super admin login if not authenticated
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = sessionStorage.getItem('superAdminAuth') === 'true';
      setIsSuperAdmin(isAuth);
      if (!isAuth) {
        navigate('/super-admin-login', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    // Only load data if super admin is authenticated
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'policies') {
      loadPolicies();
    } else if (activeTab === 'news') {
      loadNews();
    }
  }, [activeTab, isSuperAdmin]);

  // Return null while redirecting
  if (!isSuperAdmin) {
    return null;
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['assembly', 'minister'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('policies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error('Error loading policies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ghana_news')
        .select('*')
        .order('published_date', { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.district.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPolicies = policies.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredNews = newsList.filter(
    (n) =>
      n.title.toLowerCase().includes(query.toLowerCase()) ||
      n.description.toLowerCase().includes(query.toLowerCase()) ||
      n.source.toLowerCase().includes(query.toLowerCase())
  );

  const handleUserSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Create auth user first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert into users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name,
            email,
            district,
            role,
            verified: true, // Admin users are pre-verified
          });

        if (insertError) throw insertError;

        // Reload users
        await loadUsers();

        // Reset form
        setName('');
        setEmail('');
        setPassword('');
        setDistrict(DISTRICTS[0]);
        setRole('assembly');
        setShowUserForm(false);
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handlePolicySubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (editingPolicy) {
        // Update existing policy
        const { error } = await supabase
          .from('policies')
          .update({
            title: policyTitle,
            description: policyDescription,
            category: policyCategory,
            status: policyStatus,
          })
          .eq('id', editingPolicy.id);

        if (error) throw error;
      } else {
        // Create new policy
        const { error } = await supabase
          .from('policies')
          .insert({
            title: policyTitle,
            description: policyDescription,
            category: policyCategory,
            status: policyStatus,
            created_by: user?.id || null,
          });

        if (error) throw error;
      }

      // Reload policies
      await loadPolicies();

      // Reset form
      setPolicyTitle('');
      setPolicyDescription('');
      setPolicyCategory('');
      setPolicyStatus('active');
      setEditingPolicy(null);
      setShowPolicyForm(false);
    } catch (err: any) {
      console.error('Error saving policy:', err);
      setError(err.message || 'Could not save policy. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePolicyEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setPolicyTitle(policy.title);
    setPolicyDescription(policy.description);
    setPolicyCategory(policy.category);
    setPolicyStatus(policy.status as 'draft' | 'active' | 'archived');
    setShowPolicyForm(true);
  };

  const handlePolicyDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    try {
      // First, delete related records (votes, official responses, etc.)
      // Delete policy votes
      const { error: votesError } = await supabase
        .from('policy_votes')
        .delete()
        .eq('policy_id', id);

      if (votesError) {
        console.error('Error deleting policy votes:', votesError);
      }

      // Delete official responses
      const { error: responsesError } = await supabase
        .from('official_responses')
        .delete()
        .eq('policy_id', id);

      if (responsesError) {
        console.error('Error deleting official responses:', responsesError);
      }

      // Now delete the policy
      const { error } = await supabase
        .from('policies')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting policy:', error);
        throw error;
      }

      await loadPolicies();
      alert('Policy deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting policy:', err);
      alert(`Failed to delete policy: ${err.message || 'Unknown error'}`);
    }
  };

  const handleNewsSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let finalImageUrl = newsImageUrl;

      // Upload image if a file was selected
      if (newsImageFile) {
        setUploadingImage(true);
        const fileExt = newsImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `news/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('ghana-news-images')
          .upload(filePath, newsImageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error(`Image upload failed: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ghana-news-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
        setUploadingImage(false);
      }

      if (editingNews) {
        // Update existing news
        const { error } = await supabase
          .from('ghana_news')
          .update({
            title: newsTitle,
            description: newsDescription,
            image_url: finalImageUrl,
            source: newsSource,
            published_date: newsPublishedDate,
          })
          .eq('id', editingNews.id);

        if (error) throw error;
      } else {
        // Create new news
        const { error } = await supabase
          .from('ghana_news')
          .insert({
            title: newsTitle,
            description: newsDescription,
            image_url: finalImageUrl,
            source: newsSource,
            published_date: newsPublishedDate,
          });

        if (error) throw error;
      }

      // Reload news
      await loadNews();

      // Reset form
      setNewsTitle('');
      setNewsDescription('');
      setNewsImageUrl('');
      setNewsSource('');
      setNewsPublishedDate(new Date().toISOString().split('T')[0]);
      setNewsImageFile(null);
      setEditingNews(null);
      setShowNewsForm(false);
    } catch (err: any) {
      console.error('Error saving news:', err);
      setError(err.message || 'Could not save news. Please try again.');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const handleNewsEdit = (news: GhanaNews) => {
    setEditingNews(news);
    setNewsTitle(news.title);
    setNewsDescription(news.description);
    setNewsImageUrl(news.image_url);
    setNewsSource(news.source);
    setNewsPublishedDate(news.published_date);
    setShowNewsForm(true);
  };

  const handleNewsDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;

    try {
      const { error } = await supabase
        .from('ghana_news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadNews();
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('Failed to delete news');
    }
  };

  const assemblyCount = adminUsers.filter((u) => u.role === 'assembly').length;
  const ministerCount = adminUsers.filter((u) => u.role === 'minister').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Ghana Flag Colors Stripe */}
      <div className="flex h-1.5 md:h-2 w-full shrink-0 shadow-sm">
        <div className="flex-1 bg-ghana-red" />
        <div className="flex-1 bg-ghana-gold" />
        <div className="flex-1 bg-ghana-green" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="animate-slide-in-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-ghana-red/10 p-2">
                <Shield className="h-6 w-6 text-ghana-red" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
                <p className="text-xs text-slate-500">Super Administrator</p>
              </div>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('superAdminAuth');
                navigate('/super-admin-login');
              }}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600 border border-slate-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
          <p className="text-sm text-slate-500">
            Manage users, policies, and news. Only super administrators can access this page.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'users'
                ? 'border-ghana-red text-ghana-red'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Admin Users
            </div>
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'policies'
                ? 'border-ghana-red text-ghana-red'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Policies
            </div>
          </button>
          <button
            onClick={() => setActiveTab('news')}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'news'
                ? 'border-ghana-red text-ghana-red'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Ghana News
            </div>
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="card p-4 animate-bounce-in">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-ghana-green/10 p-2">
                    <UserCog className="h-5 w-5 text-ghana-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{assemblyCount}</p>
                    <p className="text-xs text-slate-600">Assembly Members</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 animate-bounce-in animate-delay-100">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-ghana-gold/10 p-2">
                    <Crown className="h-5 w-5 text-ghana-gold" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{ministerCount}</p>
                    <p className="text-xs text-slate-600">Ministers</p>
                  </div>
                </div>
              </div>

              <div className="card p-4 animate-bounce-in animate-delay-200">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-ghana-red/10 p-2">
                    <Users className="h-5 w-5 text-ghana-red" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{adminUsers.length}</p>
                    <p className="text-xs text-slate-600">Total Admin Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-slide-in-right">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="input pl-9"
                />
              </div>
              <button
                onClick={() => {
                  setShowUserForm(!showUserForm);
                  setError(null);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New User
              </button>
            </div>

            {/* Add User Form */}
            {showUserForm && (
              <div className="card p-6 animate-scale-in">
                <h2 className="mb-4 text-lg font-bold text-slate-900">Create New Admin User</h2>
                <form onSubmit={handleUserSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                      <input
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input"
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        placeholder="Minimum 8 characters"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="input"
                      >
                        {DISTRICTS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'assembly' | 'minister')}
                        className="input"
                      >
                        <option value="assembly">Assembly Member</option>
                        <option value="minister">Minister</option>
                      </select>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submitting ? 'Creating...' : 'Create User'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUserForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users List */}
            <div className="card overflow-hidden animate-slide-up">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
                <h2 className="font-semibold text-slate-900">Admin Users</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    {query ? `No users match "${query}"` : 'No admin users yet. Add one above.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredUsers.map((u, index) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{u.name}</h3>
                          <span
                            className={`badge ${
                              u.role === 'minister' ? 'badge-gold' : 'badge-green'
                            }`}
                          >
                            {u.role === 'minister' ? 'Minister' : 'Assembly Member'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{u.email}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{u.district}</p>
                      </div>
                      <button
                        onClick={() => handleUserDelete(u.id)}
                        className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Policies Tab */}
        {activeTab === 'policies' && (
          <>
            {/* Search and Add Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search policies..."
                  className="input pl-9"
                />
              </div>
              <button
                onClick={() => {
                  setShowPolicyForm(!showPolicyForm);
                  setEditingPolicy(null);
                  setPolicyTitle('');
                  setPolicyDescription('');
                  setPolicyCategory('');
                  setPolicyStatus('active');
                  setError(null);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Policy
              </button>
            </div>

            {/* Add/Edit Policy Form */}
            {showPolicyForm && (
              <div className="card p-6 animate-scale-in">
                <h2 className="mb-4 text-lg font-bold text-slate-900">
                  {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
                </h2>
                <form onSubmit={handlePolicySubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                    <input
                      required
                      value={policyTitle}
                      onChange={(e) => setPolicyTitle(e.target.value)}
                      className="input"
                      placeholder="Policy title"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      required
                      value={policyDescription}
                      onChange={(e) => setPolicyDescription(e.target.value)}
                      className="input min-h-[120px]"
                      placeholder="Policy description and details"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                      <input
                        required
                        value={policyCategory}
                        onChange={(e) => setPolicyCategory(e.target.value)}
                        className="input"
                        placeholder="e.g., Education, Health, Infrastructure"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
                      <select
                        value={policyStatus}
                        onChange={(e) => setPolicyStatus(e.target.value as 'draft' | 'active' | 'archived')}
                        className="input"
                      >
                        <option value="draft">Draft</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : editingPolicy ? 'Update Policy' : 'Create Policy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPolicyForm(false);
                        setEditingPolicy(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Policies List */}
            <div className="card overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
                <h2 className="font-semibold text-slate-900">Policies ({policies.length})</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : filteredPolicies.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    {query ? `No policies match "${query}"` : 'No policies yet. Add one above.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredPolicies.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{p.title}</h3>
                            <span className={`badge ${
                              p.status === 'active' ? 'badge-green' : 
                              p.status === 'draft' ? 'badge-gold' : 
                              'badge-red'
                            }`}>
                              {p.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{p.description}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Category: {p.category}</span>
                            <span>•</span>
                            <span>{new Date(p.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handlePolicyEdit(p)}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            aria-label="Edit policy"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePolicyDelete(p.id)}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete policy"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <>
            {/* Search and Add Button */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search news..."
                  className="input pl-9"
                />
              </div>
              <button
                onClick={() => {
                  setShowNewsForm(!showNewsForm);
                  setEditingNews(null);
                  setNewsTitle('');
                  setNewsDescription('');
                  setNewsImageUrl('');
                  setNewsSource('');
                  setNewsPublishedDate(new Date().toISOString().split('T')[0]);
                  setError(null);
                }}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add News Item
              </button>
            </div>

            {/* Add/Edit News Form */}
            {showNewsForm && (
              <div className="card p-6 animate-scale-in">
                <h2 className="mb-4 text-lg font-bold text-slate-900">
                  {editingNews ? 'Edit News' : 'Create News Item'}
                </h2>
                <form onSubmit={handleNewsSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
                    <input
                      required
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      className="input"
                      placeholder="News headline"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                    <textarea
                      required
                      value={newsDescription}
                      onChange={(e) => setNewsDescription(e.target.value)}
                      className="input min-h-[120px]"
                      placeholder="News description and content"
                    />
                  </div>

                  {/* Image Upload Section */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">News Image</label>
                    
                    {/* Image Upload */}
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewsImageFile(file);
                            // Show preview
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewsImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-ghana-green file:text-white hover:file:bg-ghana-green/90 cursor-pointer"
                      />
                      
                      {/* OR Text */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="text-xs text-slate-400">OR</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                      </div>
                      
                      {/* Image URL Input */}
                      <input
                        value={newsImageUrl}
                        onChange={(e) => {
                          setNewsImageUrl(e.target.value);
                          setNewsImageFile(null); // Clear file if URL is entered
                        }}
                        className="input"
                        placeholder="Or paste image URL: https://example.com/image.jpg"
                      />
                      
                      {/* Image Preview */}
                      {newsImageUrl && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-600 mb-2">Preview:</p>
                          <img
                            src={newsImageUrl}
                            alt="Preview"
                            className="w-full max-w-xs h-32 object-cover rounded-lg border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                            }}
                          />
                        </div>
                      )}
                      
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          Uploading image...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Source</label>
                      <input
                        required
                        value={newsSource}
                        onChange={(e) => setNewsSource(e.target.value)}
                        className="input"
                        placeholder="e.g., GNA, Graphic Online"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">Published Date</label>
                      <input
                        type="date"
                        required
                        value={newsPublishedDate}
                        onChange={(e) => setNewsPublishedDate(e.target.value)}
                        className="input"
                      />
                    </div>
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : editingNews ? 'Update News' : 'Create News'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewsForm(false);
                        setEditingNews(null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* News List */}
            <div className="card overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-3">
                <h2 className="font-semibold text-slate-900">Ghana News ({newsList.length})</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">Loading...</p>
                </div>
              ) : filteredNews.length === 0 ? (
                <div className="p-8 text-center">
                  <Newspaper className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    {query ? `No news items match "${query}"` : 'No news yet. Add one above.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredNews.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4 flex-1">
                          {n.image_url && (
                            <img
                              src={n.image_url}
                              alt={n.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{n.title}</h3>
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{n.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>{n.source}</span>
                              <span>•</span>
                              <span>{new Date(n.published_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleNewsEdit(n)}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            aria-label="Edit news"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleNewsDelete(n.id)}
                            className="rounded-md p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete news"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      </div>
    </div>
  );
}
