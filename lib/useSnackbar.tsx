import React, { useState } from 'react'

import { Alert, Snackbar } from '@mui/material'

const useSnackbar = () => {
  const [message, setMessage] = useState<string | null>(null)

  const closeSnackbar = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }
    setMessage(null)
  }

  const AlertSnackbar: React.FC = ({ ...props }) => {
    return (
      <Snackbar
        open={message !== null}
        autoHideDuration={5000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        {...props}
      >
        <Alert onClose={closeSnackbar} severity="error">
          {message}
        </Alert>
      </Snackbar>
    )
  }

  return { setMessage, AlertSnackbar }
}

export default useSnackbar
