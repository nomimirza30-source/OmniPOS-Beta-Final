import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Edit3, Trash2, Plus, Tag, Image as ImageIcon } from 'lucide-react';
import Modal from './Modal';

const MenuEditor = () => {
    const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, updateMenuStock, user } = useStore();
    const isKitchen = user.role === 'Kitchen';
    const [activeTab, setActiveTab] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        cat: 'Mains',
        price: '',
        image: '',
        stock: 'High'
    });

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item });
        } else {
            setEditingItem(null);
            setFormData({ name: '', cat: 'Mains', price: '', image: '', stock: 'High' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = { ...formData, price: parseFloat(formData.price) };
        if (editingItem) {
            updateMenuItem(editingItem.id, data);
        } else {
            addMenuItem(data);
        }
        setIsModalOpen(false);
    };

    const filteredItems = activeTab === 'All' ? menuItems : menuItems.filter(i => i.cat === activeTab);

    return (
        <div className="glass-card rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-text">{isKitchen ? 'Stock Control Center' : 'Menu Management'}</h2>
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">
                        {isKitchen ? 'Toggle availability for active service' : 'Full menu lifecycle & pricing control'}
                    </p>
                </div>
                {!isKitchen && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/30 transition-all"
                    >
                        <Plus size={16} /> New Item
                    </button>
                )}
            </div>

            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {['All', ...categories].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeTab === cat
                            ? 'bg-primary text-slate-950 border-primary shadow-lg shadow-primary/20'
                            : 'bg-glass/20 text-muted border-text/10 hover:border-text/20'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredItems.map(item => (
                    <div key={item.id} className="bg-glass/20 border border-text/10 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-text/10 bg-glass/40">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                        <ImageIcon size={20} />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-text group-hover:text-primary transition-colors">{item.name}</h4>
                                <p className="text-xs text-muted font-medium">{item.cat} • £{item.price.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex bg-glass/20 p-1 rounded-xl border border-text/10">
                                {[
                                    { id: 'High', color: 'text-success' },
                                    { id: 'Medium', color: 'text-warning' },
                                    { id: 'Low', color: 'text-red-400' },
                                    { id: 'Not Available', color: 'text-muted' }
                                ].map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => updateMenuStock(item.id, s.id)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${item.stock === s.id ? `${s.color} bg-glass/40 shadow-lg` : 'text-muted/60 hover:text-muted'}`}
                                        title={`Mark as ${s.id}`}
                                    >
                                        {s.id}
                                    </button>
                                ))}
                            </div>

                            {!isKitchen && (
                                <div className="flex items-center gap-1 border-l border-text/10 pl-2">
                                    <button onClick={() => handleOpenModal(item)} className="p-2 text-muted hover:text-text transition-colors" title="Edit Metadata"><Edit3 size={16} /></button>
                                    <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-muted hover:text-red-400 transition-colors" title="Remove Permanently"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1">Item Name</label>
                        <input
                            required
                            className="bg-glass/20 border border-text/10 rounded-xl p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Steak Frites"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1">Category</label>
                            <select
                                className="bg-glass border border-text/10 rounded-xl p-3 text-text focus:outline-none"
                                value={formData.cat}
                                onChange={e => setFormData({ ...formData, cat: e.target.value })}
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1">Price (£)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                className="bg-glass/20 border border-text/10 rounded-xl p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold"
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1">Initial Stock Level</label>
                        <select
                            className="bg-glass border border-text/10 rounded-xl p-3 text-text focus:outline-none text-sm font-bold"
                            value={formData.stock}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                        >
                            <option value="High">High Stock</option>
                            <option value="Medium">Medium Stock</option>
                            <option value="Low">Low Stock</option>
                            <option value="Not Available">Not Available (86-ed)</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-muted uppercase tracking-widest pl-1">Image (URL or Upload)</label>
                        <div className="flex gap-2">
                            <input
                                className="flex-1 bg-glass/20 border border-text/10 rounded-xl p-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                placeholder="Paste image URL..."
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex items-center justify-center p-3 bg-glass/40 hover:bg-glass/60 border border-text/10 rounded-xl text-muted cursor-pointer transition-colors"
                                    title="Upload File"
                                >
                                    <ImageIcon size={20} />
                                </label>
                            </div>
                        </div>
                        {formData.image && (
                            <div className="mt-2 text-[10px] text-primary font-bold overflow-hidden text-ellipsis whitespace-nowrap px-1">
                                Image Source: {formData.image.startsWith('data:') ? 'Local File Uploaded' : 'Web URL'}
                            </div>
                        )}
                    </div>
                    <button type="submit" className="bg-primary text-slate-950 font-bold py-3 rounded-xl mt-4 hover:shadow-lg transition-all">
                        {editingItem ? 'Update Item' : 'Create Item'}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default MenuEditor;
