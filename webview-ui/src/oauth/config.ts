import { defaultAuthConfig, getAuthUrls } from "../config/auth"

// 完整的AuthConfig接口，对应扩展后的ApiConfiguration
export interface AuthConfig {
	baseUrl: string
	realmName: string
	clientId: string
	clientSecret: string
	loginUrl: string
	logoutUrl: string
	tokenUrl: string
	redirectUri: string
}

class AuthConfigManager {
	private static instance: AuthConfigManager
	private config: AuthConfig

	private constructor() {
		this.config = this.initConfig(defaultAuthConfig)
	}

	private initConfig(config: Partial<AuthConfig>): AuthConfig {
		// 合并默认值和提供的配置
		const baseConfig = {
			baseUrl: config.baseUrl || defaultAuthConfig.baseUrl,
			realmName: config.realmName || defaultAuthConfig.realmName,
			clientId: config.clientId || defaultAuthConfig.clientId,
			clientSecret: config.clientSecret || defaultAuthConfig.clientSecret,
		}

		// 直接使用提供的URL，如果没有则从baseUrl生成
		const urls =
			config.loginUrl && config.logoutUrl && config.tokenUrl && config.redirectUri
				? {
						loginUrl: config.loginUrl,
						logoutUrl: config.logoutUrl,
						tokenUrl: config.tokenUrl,
						redirectUri: config.redirectUri,
					}
				: getAuthUrls(baseConfig as AuthConfig)

		return {
			...baseConfig,
			...urls,
		}
	}

	public static getInstance(): AuthConfigManager {
		if (!AuthConfigManager.instance) {
			AuthConfigManager.instance = new AuthConfigManager()
		}
		return AuthConfigManager.instance
	}

	public getConfig(): AuthConfig {
		return this.config
	}

	public updateConfig(newConfig: Partial<AuthConfig>): void {
		// 只更新提供的配置项
		const updatedConfig = { ...this.config }

		// 更新基础URL和认证信息
		if (newConfig.baseUrl) updatedConfig.baseUrl = newConfig.baseUrl
		if (newConfig.realmName) updatedConfig.realmName = newConfig.realmName
		if (newConfig.clientId) updatedConfig.clientId = newConfig.clientId
		if (newConfig.clientSecret) updatedConfig.clientSecret = newConfig.clientSecret

		// 直接更新URL，如果有提供
		if (newConfig.loginUrl) updatedConfig.loginUrl = newConfig.loginUrl
		if (newConfig.logoutUrl) updatedConfig.logoutUrl = newConfig.logoutUrl
		if (newConfig.tokenUrl) updatedConfig.tokenUrl = newConfig.tokenUrl
		if (newConfig.redirectUri) updatedConfig.redirectUri = newConfig.redirectUri

		// 如果没有提供完整的URL集，但提供了baseUrl，则重新生成URL
		if (
			newConfig.baseUrl &&
			!(newConfig.loginUrl && newConfig.logoutUrl && newConfig.tokenUrl && newConfig.redirectUri)
		) {
			const urls = getAuthUrls({
				...updatedConfig,
				baseUrl: newConfig.baseUrl,
			})
			updatedConfig.loginUrl = urls.loginUrl
			updatedConfig.logoutUrl = urls.logoutUrl
			updatedConfig.tokenUrl = urls.tokenUrl
			updatedConfig.redirectUri = urls.redirectUri
		}

		this.config = updatedConfig
	}
}

export const authConfigManager = AuthConfigManager.getInstance()
export const getAuthConfig = () => authConfigManager.getConfig()
export const updateAuthConfig = (config: Partial<AuthConfig>) => authConfigManager.updateConfig(config)
