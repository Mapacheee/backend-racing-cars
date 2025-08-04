export const CAMERA_CONFIG = {
    position: [0, 80, 120] as const,
    fov: 30
}

export const LIGHTING_CONFIG = {
    ambient: {
        intensity: 0.7
    },
    directional: {
        position: [5, 10, 7] as const,
        intensity: 1
    }
}

export const GROUND_CONFIG = {
    position: [0, -0.5, 0] as const,
    size: [80, 80] as const,
    colors: {
        normal: 'lightgreen',
        editMode: 'lightblue',
        moveMode: 'lightcoral'
    }
}
