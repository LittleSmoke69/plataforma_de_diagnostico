'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit, Trash2, Ban, CheckCircle, XCircle, Search } from 'lucide-react'
import { EditUserModal } from './EditUserModal'

interface User {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  status: 'active' | 'inactive' | 'blocked'
  diagnostics_limit: number
  created_at: string
  updated_at: string
}

interface UsersTableProps {
  initialUsers?: User[]
  initialPagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function UsersTable({ initialUsers = [], initialPagination }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [pagination, setPagination] = useState(
    initialPagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
  )
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async (page: number = 1, search: string = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao carregar usuários')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        fetchUsers(1, searchTerm)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      fetchUsers(pagination.page, searchTerm)
    }
  }, [searchTerm])

  const handleEdit = (user: User) => {
    setEditingUser(user)
  }

  const handleUserUpdated = () => {
    setEditingUser(null)
    fetchUsers(pagination.page, searchTerm)
  }

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'blocked') => {
    if (!confirm(`Tem certeza que deseja ${newStatus === 'active' ? 'ativar' : newStatus === 'inactive' ? 'desativar' : 'bloquear'} este usuário?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao atualizar status')
      }

      await fetchUsers(pagination.page, searchTerm)
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status do usuário')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <XCircle className="w-3 h-3 mr-1" />
            Inativo
          </span>
        )
      case 'blocked':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            <Ban className="w-3 h-3 mr-1" />
            Bloqueado
          </span>
        )
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        Admin
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
        Usuário
      </span>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Header com busca */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Gerenciamento de Usuários</h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="p-4 sm:p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Limite
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Criado em
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loading && users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  Carregando...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                    {user.id.substring(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {user.name || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-3 text-sm">{getRoleBadge(user.role)}</td>
                  <td className="px-4 py-3 text-sm">{getStatusBadge(user.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.diagnostics_limit}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                        title="Editar usuário"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'active')}
                          className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Ativar usuário"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.status !== 'blocked' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'blocked')}
                          className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Bloquear usuário"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(user.id, 'inactive')}
                          className="p-1.5 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded transition-colors"
                          title="Desativar usuário"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination.totalPages > 1 && (
        <div className="px-4 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            Mostrando {users.length} de {pagination.total} usuários
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(pagination.page - 1, searchTerm)}
              disabled={pagination.page === 1 || loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-700">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchUsers(pagination.page + 1, searchTerm)}
              disabled={pagination.page === pagination.totalPages || loading}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {/* Modal de edição */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={handleUserUpdated}
        />
      )}
    </div>
  )
}

