import type { JSX, ReactNode } from 'react'
import { WaypointModalProvider } from '../../../routes/training/simulation/contexts/WaypointModalContext'
import { RaceResetProvider } from '../../contexts/RaceResetContext'

interface TrackEditorProvidersProps {
    children: ReactNode
}

export default function TrackEditorProviders({
    children,
}: TrackEditorProvidersProps): JSX.Element {
    return (
        <WaypointModalProvider>
            <RaceResetProvider>{children}</RaceResetProvider>
        </WaypointModalProvider>
    )
}
