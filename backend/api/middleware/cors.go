package middleware

import (
	"Torchlight/api/router"
)

func Cors(ctx *router.Context) {
	ctx.Header("Access-Control-Allow-Origin", "*")
	ctx.Header("Access-Control-Allow-Methods", "*")
	ctx.Header("Access-Control-Allow-Headers", "*")
	ctx.Next()
}
