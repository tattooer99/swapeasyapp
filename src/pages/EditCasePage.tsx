import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTelegram } from '../hooks/useTelegram'
import { useSupabase } from '../hooks/useSupabase'
import PhotoUploader from '../components/PhotoUploader'
import { ITEM_TYPES, PRICE_CATEGORIES, Case } from '../types'
import { safeBackButtonShow, safeBackButtonHide } from '../utils/telegram'
import './EditCasePage.css'

export default function EditCasePage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { webApp } = useTelegram()
  const { currentUser, loading: userLoading, getMyCases, updateCase } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [caseItem, setCaseItem] = useState<Case | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    item_type: '',
    description: '',
    price_category: '',
    photos: [] as string[],
  })

  const handleSave = useCallback(async () => {
    if (!caseItem) return

    if (!formData.title || !formData.item_type || !formData.description || !formData.price_category) {
      if (webApp) {
        webApp.showAlert('Будь ласка, заповніть всі поля')
      } else {
        alert('Будь ласка, заповніть всі поля')
      }
      return
    }

    try {
      setSaving(true)
      if (webApp?.MainButton) {
        webApp.MainButton.showProgress()
      }

      await updateCase(caseItem.id, {
        title: formData.title,
        item_type: formData.item_type,
        description: formData.description,
        price_category: formData.price_category,
        photo1: formData.photos[0] || null,
        photo2: formData.photos[1] || null,
        photo3: formData.photos[2] || null,
      })

      if (webApp) {
        webApp.HapticFeedback?.notificationOccurred('success')
        webApp.showAlert('Кейс успішно оновлено!', () => {
          navigate('/my-cases')
        })
      } else {
        alert('Кейс успішно оновлено!')
        navigate('/my-cases')
      }
    } catch (error) {
      console.error('Error updating case:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (webApp) {
        webApp.showAlert('Помилка при оновленні кейсу: ' + errorMessage)
      } else {
        alert('Помилка при оновленні кейсу: ' + errorMessage)
      }
    } finally {
      setSaving(false)
      if (webApp?.MainButton) {
        webApp.MainButton.hideProgress()
      }
    }
  }, [caseItem, formData, webApp, navigate, updateCase])

  useEffect(() => {
    if (webApp) {
      safeBackButtonShow(webApp, () => navigate('/my-cases'))
    }

    if (webApp?.MainButton) {
      webApp.MainButton.setText('Зберегти зміни')
      webApp.MainButton.show()
      webApp.MainButton.onClick(handleSave)
    }

    return () => {
      if (webApp) {
        safeBackButtonHide(webApp)
      }
      if (webApp?.MainButton) {
        webApp.MainButton.hide()
        webApp.MainButton.offClick(handleSave)
      }
    }
  }, [webApp, navigate, handleSave])

  useEffect(() => {
    // Ждем загрузки пользователя перед загрузкой кейса
    if (!userLoading && currentUser && id) {
      loadCase()
    } else if (!userLoading && !currentUser) {
      console.warn('EditCasePage: currentUser is null, cannot load case')
      setLoading(false)
    }
  }, [id, currentUser, userLoading])

  const loadCase = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      console.log('EditCasePage: loading case with id:', id)
      const cases = await getMyCases()
      console.log('EditCasePage: loaded cases:', cases.length)
      const foundCase = cases.find(c => c.id === Number(id))
      
      if (!foundCase) {
        console.warn('EditCasePage: case not found, id:', id)
        if (webApp) {
          webApp.showAlert('Кейс не знайдено')
        } else {
          alert('Кейс не знайдено')
        }
        navigate('/my-cases')
        return
      }

      console.log('EditCasePage: found case:', foundCase)
      setCaseItem(foundCase)
      setFormData({
        title: foundCase.title,
        item_type: foundCase.item_type,
        description: foundCase.description,
        price_category: foundCase.price_category,
        photos: [
          foundCase.photo1,
          foundCase.photo2,
          foundCase.photo3,
        ].filter(Boolean) as string[],
      })
    } catch (error) {
      console.error('Error loading case:', error)
      if (webApp) {
        webApp.showAlert('Помилка при завантаженні кейсу')
      } else {
        alert('Помилка при завантаженні кейсу')
      }
      navigate('/my-cases')
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="edit-case-page">
        <div className="edit-case-page__loading">Завантаження...</div>
      </div>
    )
  }

  if (!caseItem) {
    return (
      <div className="edit-case-page">
        <div className="edit-case-page__empty">
          <p>Кейс не знайдено.</p>
          <button className="edit-case-page__button" onClick={() => navigate('/my-cases')}>
            До моїх кейсів
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="edit-case-page">
      <div className="edit-case-page__header">
        <h2>Редагувати кейс</h2>
      </div>

      <div className="edit-case-page__form">
        <div className="edit-case-page__field">
          <label>Назва кейсу</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Наприклад: iPhone 12"
            className="edit-case-page__input"
          />
        </div>

        <div className="edit-case-page__field">
          <label>Тип кейсу</label>
          <div className="edit-case-page__options">
            {ITEM_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`edit-case-page__option ${formData.item_type === type.value ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, item_type: type.value })}
              >
                <span className="edit-case-page__option-emoji">{type.emoji}</span>
                <span>{type.value}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="edit-case-page__field">
          <label>Опис</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Опишіть ваш кейс детально..."
            className="edit-case-page__textarea"
            rows={6}
          />
        </div>

        <div className="edit-case-page__field">
          <label>Цінова категорія</label>
          <div className="edit-case-page__options">
            {PRICE_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={`edit-case-page__option ${formData.price_category === category ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, price_category: category })}
              >
                💸 {category}
              </button>
            ))}
          </div>
        </div>

        <div className="edit-case-page__field">
          <label>Фото (до 3 штук)</label>
          <PhotoUploader
            maxPhotos={3}
            initialPhotos={formData.photos}
            onPhotosChange={(photos) => setFormData({ ...formData, photos })}
          />
        </div>

        <div className="edit-case-page__buttons">
          <button
            className="edit-case-page__button edit-case-page__button--save"
            onClick={handleSave}
            disabled={saving || !formData.title || !formData.item_type || !formData.description || !formData.price_category}
          >
            {saving ? 'Збереження...' : 'Зберегти зміни'}
          </button>
          <button
            className="edit-case-page__button edit-case-page__button--cancel"
            onClick={() => navigate('/my-cases')}
            disabled={saving}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  )
}

