import { useQuery } from "convex/react"
import { useTheme } from "@/lib/Theme"
import { api } from "@/convex/_generated/api"

export const useProfile = () => {
  const theme = useTheme()

  // Get current user profile from Convex - only if authenticated
  const Profile = useQuery(api.users.queries.getCurrentProfile)

  const isLoading = Profile === undefined

  return {
    // Profile data and states
    Profile,
    isLoading,

    // Theme
    theme
  }
}
