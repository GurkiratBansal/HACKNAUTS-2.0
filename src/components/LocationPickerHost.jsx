import { useLocation } from '../context/LocationContext'
import LocationPicker from './LocationPicker'

/** Mounts the single global location picker driven by LocationContext. */
export default function LocationPickerHost() {
  const { pickerOpen, closePicker } = useLocation()
  return <LocationPicker open={pickerOpen} onClose={closePicker} />
}
