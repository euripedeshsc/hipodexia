import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, PlusCircle, Save, Edit3, Trash2, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminPanel({ onBack }) {
  const [questions, setQuestions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    blue_text: '',
    yellow_question: '',
    yellow_options: ['', '', '', ''],
    yellow_correct_index: 0,
    red_text: '',
    red_options: ['', '', '', ''],
    red_correct_index: 0
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    const { data } = await supabase.from('questions').select('*').order('id', { ascending: false });
    if (data) setQuestions(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (phase, index, value) => {
    setFormData(prev => {
      const newOptions = [...prev[`${phase}_options`]];
      newOptions[index] = value;
      return { ...prev, [`${phase}_options`]: newOptions };
    });
  };

  const resetForm = () => {
    setFormData({
      blue_text: '',
      yellow_question: '',
      yellow_options: ['', '', '', ''],
      yellow_correct_index: 0,
      red_text: '',
      red_options: ['', '', '', ''],
      red_correct_index: 0
    });
    setEditingId(null);
  };

  const handleEdit = (q) => {
    setFormData({
      blue_text: q.blue_text,
      yellow_question: q.yellow_question,
      yellow_options: q.yellow_options,
      yellow_correct_index: q.yellow_correct_index,
      red_text: q.red_text,
      red_options: q.red_options,
      red_correct_index: q.red_correct_index
    });
    setEditingId(q.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Excluir Caso Clínico?',
      text: 'Essa ação não pode ser desfeita e removerá a carta do sorteio.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-slate-800'
      }
    });

    if (result.isConfirmed) {
      const { error } = await supabase.from('questions').delete().eq('id', id);
      if (!error) {
        Swal.fire({
          title: 'Excluído!',
          text: 'O caso clínico foi removido com sucesso.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchQuestions();
      } else {
        Swal.fire('Erro', 'Não foi possível excluir a carta.', 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (editingId) {
      const { error } = await supabase.from('questions').update(formData).eq('id', editingId);
      if (!error) {
        Swal.fire({
          title: 'Atualizado com Sucesso!',
          text: 'As alterações no caso clínico foram salvas.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
        resetForm();
        fetchQuestions();
      } else {
        Swal.fire('Erro ao Atualizar', 'Verifique a conexão com o banco de dados.', 'error');
        console.error(error);
      }
    } else {
      const { error } = await supabase.from('questions').insert([formData]);
      if (!error) {
        Swal.fire({
          title: 'Carta Cadastrada!',
          text: 'O novo caso clínico já está disponível para as partidas.',
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
        resetForm();
        fetchQuestions();
      } else {
        Swal.fire('Erro ao Cadastrar', 'Verifique os dados ou o schema do banco.', 'error');
        console.error(error);
      }
    }
    
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center">
            <span className="text-medical-blue mr-3">Área de Administração</span>
          </h1>
          <button onClick={onBack} className="flex items-center text-slate-600 hover:text-medical-blue font-bold">
            <ArrowLeft className="w-5 h-5 mr-1" /> Voltar ao Jogo
          </button>
        </div>

        <div className={`bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 transition-colors ${editingId ? 'border-medical-yellow shadow-medical-yellow/20' : 'border-slate-200'}`}>
          <h2 className="text-xl font-bold text-slate-700 mb-6 flex items-center">
            {editingId ? (
              <><Edit3 className="w-6 h-6 mr-2 text-medical-yellow" /> Editando Carta ID: {editingId}</>
            ) : (
              <><PlusCircle className="w-6 h-6 mr-2 text-medical-blue" /> Cadastrar Novo Caso Clínico</>
            )}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="p-4 bg-medical-blueLight/30 rounded-xl border border-medical-blue/30">
              <label className="block text-sm font-bold text-medical-blueDark mb-2">Carta Azul (O Caso)</label>
              <textarea 
                name="blue_text" value={formData.blue_text} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-medical-blue outline-none" rows="3"
                placeholder="Ex: Paciente dá entrada no PS com falta de ar..."
              ></textarea>
            </div>

            <div className="p-4 bg-medical-yellowLight/30 rounded-xl border border-medical-yellow/50">
              <label className="block text-sm font-bold text-slate-700 mb-2">Carta Amarela (Pergunta)</label>
              <input 
                type="text" name="yellow_question" value={formData.yellow_question} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 rounded-lg mb-4 outline-none" placeholder="Qual a conduta inicial?"
              />
              
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={`y-${i}`} className="flex items-center space-x-2">
                    <input 
                      type="radio" name="yellow_correct" checked={formData.yellow_correct_index === i} 
                      onChange={() => setFormData(p => ({...p, yellow_correct_index: i}))} 
                    />
                    <input 
                      type="text" value={formData.yellow_options[i]} onChange={e => handleOptionChange('yellow', i, e.target.value)} required
                      className="w-full p-2 border border-slate-300 rounded outline-none" placeholder={`Opção ${i+1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-medical-redLight/30 rounded-xl border border-medical-red/30">
              <label className="block text-sm font-bold text-slate-700 mb-2">Carta Vermelha (Urgência)</label>
              <textarea 
                name="red_text" value={formData.red_text} onChange={handleChange} required
                className="w-full p-3 border border-slate-300 rounded-lg mb-4 outline-none" rows="2"
                placeholder="Ex: O paciente evoluiu para uma PCR!"
              ></textarea>
              
              <div className="grid grid-cols-2 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={`r-${i}`} className="flex items-center space-x-2">
                    <input 
                      type="radio" name="red_correct" checked={formData.red_correct_index === i} 
                      onChange={() => setFormData(p => ({...p, red_correct_index: i}))} 
                    />
                    <input 
                      type="text" value={formData.red_options[i]} onChange={e => handleOptionChange('red', i, e.target.value)} required
                      className="w-full p-2 border border-slate-300 rounded outline-none" placeholder={`Opção ${i+1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button type="submit" disabled={isSaving} className={`flex-1 py-4 text-white font-bold rounded-xl flex justify-center items-center shadow-lg transition-transform hover:scale-105 ${editingId ? 'bg-medical-yellow hover:bg-medical-yellowDark' : 'bg-medical-blue hover:bg-medical-blueDark'}`}>
                <Save className="w-5 h-5 mr-2" /> {isSaving ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Salvar no Banco')}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="py-4 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl flex justify-center items-center shadow-sm transition-colors">
                  <X className="w-5 h-5 mr-2" /> Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        
        <h2 className="text-xl font-bold text-slate-700 mb-4">Cartas Cadastradas ({questions.length})</h2>
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:shadow-md">
              <div className="flex-1">
                <span className="font-bold text-medical-blue bg-medical-blue/10 px-2 py-1 rounded-md text-sm mr-2">ID: {q.id}</span> 
                <span className="text-slate-700 font-medium">{q.blue_text.substring(0, 80)}{q.blue_text.length > 80 ? '...' : ''}</span>
              </div>
              <div className="flex space-x-2 w-full sm:w-auto">
                <button onClick={() => handleEdit(q)} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-medical-yellowLight text-medical-yellowDark hover:bg-medical-yellow hover:text-white font-bold rounded-lg transition-colors">
                  <Edit3 className="w-4 h-4 mr-1" /> Editar
                </button>
                <button onClick={() => handleDelete(q.id)} className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-medical-redLight text-medical-red hover:bg-medical-red hover:text-white font-bold rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 mr-1" /> Excluir
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <div className="p-8 text-center bg-slate-100 rounded-xl border-2 border-dashed border-slate-300">
              <p className="text-slate-500 font-medium">Nenhuma carta cadastrada ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
