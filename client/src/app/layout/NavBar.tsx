import { Group } from "@mui/icons-material";
import { Box, AppBar, Toolbar, Typography, Container, MenuItem, MenuList, LinearProgress } from "@mui/material";
import { NavLink } from "react-router";
import MenuItemLink from "../shared/components/MenuItemLink";
import { Observer } from "mobx-react-lite";
import { useStore } from "../../lib/hooks/useStore";


export default function NavBar() {

  const {uiStore} = useStore();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar sx={{ backgroundImage: 'linear-gradient(135deg, #182a73 0%, #218aae 69%, #20a7ac 89%)', position: 'relative' }}>
        <Container maxWidth='xl'>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <MenuList>
              <Box>
                <MenuItem
                  sx={{ display: 'flex', gap: 2 }}
                  component={NavLink} to='/'>
                  <Group fontSize='large' />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Reactivities</Typography>
                </MenuItem>
              </Box>
            </MenuList>
            <MenuList>
              <Box sx={{ display: 'flex' }}>
                <MenuItemLink to='/activities'>
                  Activities
                </MenuItemLink>
                <MenuItemLink to='/createActivity'>
                  Create Activity
                </MenuItemLink>
                <MenuItemLink to='/counter'>
                  Counter
                </MenuItemLink>
              </Box>
            </ MenuList>
            <MenuList>
              User Menu
            </MenuList>
          </Toolbar>
        </Container>
        <Observer>
          {() =>
            uiStore.isLoading ? (
              <LinearProgress
                color="secondary"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 4, 
                }}
              />
            ) : null
          }
        </Observer>
      </AppBar>
    </Box>
  )
}