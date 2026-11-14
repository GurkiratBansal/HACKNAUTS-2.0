import { useUserLocation } from '../context/LocationContext'
import LocationPicker from './LocationPicker'
import Modal from './ui/Modal'

/** Mounts the single global location picker driven by LocationContext. */
export default function LocationPickerHost() {
  const { pickerOpen, closePicker } = useUserLocation()
  return (
    <Modal
      open={pickerOpen}
      onClose={closePicker}
      labelledBy="location-modal-picker-title"
      size="lg"
    >
      <LocationPicker onComplete={closePicker} idPrefix="location-modal-picker" />
    </Modal>
  )
}
