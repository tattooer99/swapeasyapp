import { useState } from 'react'
import { Case, ITEM_TYPES } from '../types'
import './CaseCard.css'

interface CaseCardProps {
  case: Case
  onLike?: () => void
  onExchange?: () => void
  onViewUser?: () => void
  showActions?: boolean
}

export default function CaseCard({
  case: caseItem,
  onLike,
  onExchange,
  onViewUser,
  showActions = true,
}: CaseCardProps) {
  const itemTypeEmoji = ITEM_TYPES.find(t => t.value === caseItem.item_type)?.emoji || '📦'
  
  // Собираем все фото, включая null/undefined значения, затем фильтруем
  const allPhotos = [caseItem.photo1, caseItem.photo2, caseItem.photo3]
  const photos = allPhotos.filter((photo): photo is string => photo != null && photo !== '')
  
  // Логируем для отладки
  console.log('CaseCard: case', caseItem.id, 'photos count:', photos.length, {
    photo1: caseItem.photo1 ? 'exists' : 'null',
    photo2: caseItem.photo2 ? 'exists' : 'null',
    photo3: caseItem.photo3 ? 'exists' : 'null',
    photos: photos
  })
  
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null)

  const handlePhotoClick = (photo: string) => {
    setFullscreenPhoto(photo)
  }

  const closeFullscreen = () => {
    setFullscreenPhoto(null)
  }

  return (
    <>
      <div className="case-card">
        {photos.length > 0 && (
          <div className="case-card__images-grid">
            {photos.length === 1 && (
              <div className="case-card__image-single" onClick={() => handlePhotoClick(photos[0])}>
                <img src={photos[0]} alt={caseItem.title} />
              </div>
            )}
            {photos.length === 2 && (
              <>
                <div className="case-card__image-half" onClick={() => handlePhotoClick(photos[0])}>
                  <img src={photos[0]} alt={caseItem.title} />
                </div>
                <div className="case-card__image-half" onClick={() => handlePhotoClick(photos[1])}>
                  <img src={photos[1]} alt={caseItem.title} />
                </div>
              </>
            )}
            {photos.length === 3 && (
              <>
                <div className="case-card__image-main" onClick={() => handlePhotoClick(photos[0])}>
                  <img src={photos[0]} alt={caseItem.title} />
                </div>
                <div className="case-card__image-side">
                  <div className="case-card__image-small" onClick={() => handlePhotoClick(photos[1])}>
                    <img src={photos[1]} alt={caseItem.title} />
                  </div>
                  <div className="case-card__image-small" onClick={() => handlePhotoClick(photos[2])}>
                    <img src={photos[2]} alt={caseItem.title} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      <div className="case-card__content">
        <div className="case-card__header">
          <h3 className="case-card__title">
            {itemTypeEmoji} {caseItem.title}
          </h3>
          {caseItem.owner && (
            <div className="case-card__owner" onClick={onViewUser}>
              👤 {caseItem.owner.name}
              {caseItem.owner.region && ` • ${caseItem.owner.region}`}
            </div>
          )}
        </div>
        <p className="case-card__description">{caseItem.description}</p>
        <div className="case-card__meta">
          <span className="case-card__type">{caseItem.item_type}</span>
          <span className="case-card__price">💸 {caseItem.price_category}</span>
        </div>
        {showActions && (onLike || onExchange) && (
          <div className="case-card__actions">
            {onLike && (
              <button className="case-card__button case-card__button--like" onClick={onLike}>
                ❤️ Подобається
              </button>
            )}
            {onExchange && (
              <button className="case-card__button case-card__button--exchange" onClick={onExchange}>
                💬 Запропонувати обмін
              </button>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Модальное окно для просмотра фото в полный размер */}
      {fullscreenPhoto && (
        <div className="case-card__fullscreen" onClick={closeFullscreen}>
          <button className="case-card__fullscreen-close" onClick={closeFullscreen}>✕</button>
          <img 
            src={fullscreenPhoto} 
            alt={caseItem.title}
            onClick={(e) => e.stopPropagation()}
            className="case-card__fullscreen-image"
          />
        </div>
      )}
    </>
  )
}

