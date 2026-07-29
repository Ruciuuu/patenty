export function ProgressRing({
    value,
    size,
    dark = false,
}: ProgressRingProps) {
    const strokeWidth = 5
    const radius =
        (size - strokeWidth) / 2

    const circumference =
        2 * Math.PI * radius

    const normalizedValue = Math.min(
        100,
        Math.max(0, value),
    )

    const strokeDashoffset =
        circumference -
        (normalizedValue / 100) *
        circumference

    return (
        <View
            className="items-center justify-center rounded-full"
            style={{
                width: size,
                height: size,
                backgroundColor: dark
                    ? 'rgba(255,255,255,0.08)'
                    : '#FFFFFF',
            }}
        >
            <Svg
                width={size}
                height={size}
                style={{
                    position: 'absolute',
                    transform: [
                        {
                            rotate: '-90deg',
                        },
                    ],
                }}
            >
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={
                        dark
                            ? 'rgba(255,255,255,0.15)'
                            : '#E5EAF3'
                    }
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={
                        dark
                            ? '#95CCDD'
                            : '#4274D9'
                    }
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeDashoffset={
                        strokeDashoffset
                    }
                    fill="transparent"
                />
            </Svg>

            <Text
                className={`text-xs font-bold ${dark
                    ? 'text-white'
                    : 'text-[#293681]'
                    }`}
            >
                {normalizedValue}%
            </Text>
        </View>
    )
}