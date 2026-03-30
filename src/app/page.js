import { Box, Card, CardContent, Typography, CardActions, Button } from "@mui/material"

export default function Home() {
  return (
    <main className="container mx-auto">
      <Box className="grid md:grid-cols-2 gap-8 mt-24 md:mt-32 px-4 relative z-20">
        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              JB Autoverhuur
            </Typography>
            <Typography variant="h5" component="div">
              Contract maken
            </Typography>
            <Typography variant="body2">
              Maak een autoverhuur contract
            </Typography>
          </CardContent>
          <CardActions>
            <Button href="/createContract" size="small">Maken</Button>
          </CardActions>
        </Card>

        <Card sx={{ minWidth: 275 }}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              JB Autoverhuur
            </Typography>
            <Typography variant="h5" component="div">
              Factuur maken
            </Typography>
            <Typography variant="body2">
              Maak een autoverhuur factuur
            </Typography>
          </CardContent>
          <CardActions>
            <Button disabled size="small">Maken</Button>
          </CardActions>
        </Card>
      </Box>
    </main>
  )
}
