import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from '@/App'

describe('App', () => {
  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('AliCooks')).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<App />)
    expect(screen.getByText('Meal planning made simple')).toBeInTheDocument()
  })
})

